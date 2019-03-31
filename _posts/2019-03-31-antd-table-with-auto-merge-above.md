---
title: 给 antd table 增加自动合并上一行的功能
layout: post
feature_image: "/image/898.jpg"
category:
    - Article
---

数据库查询时经常会使用到 group by 查询，对于此类查询返回的结果列表，用户往往会期望显示出来的表格能够合并 group by 字段对应的列。比如，对于下面的数据，期望 Department 和 Role 列能合并。

<!--more-->

<div class="my-table">
    <table>
        <thead>
            <tr><th>Department</th><th>Role</th><th>Name</th></tr>
        </thead>
        <tbody>
            <tr><td>IT</td><td>Manager</td><td>Jack</td></tr>
            <tr><td>IT</td><td>Manager</td><td>Mike</td></tr>
            <tr><td>IT</td><td>Employee</td><td>Tom</td></tr>
            <tr><td>HR</td><td>Manager</td><td>John</td></tr>
            <tr><td>HR</td><td>Employee</td><td>Jim</td></tr>
            <tr><td>HR</td><td>Employee</td><td>Joe</td></tr>
        </tbody>
    </table>
</div>

合并之后的表格效果如下，显然合并后的效果更好。

<div class="my-table">
    <table>
        <thead>
            <tr><th>Department</th><th>Role</th><th>Name</th></tr>
        </thead>
        <tbody>
            <tr><td rowspan="3">IT</td><td rowspan="2">Manager</td><td>Jack</td></tr>
            <tr><td>Mike</td></tr>
            <tr><td>Employee</td><td>Tom</td></tr>
            <tr><td rowspan="3">HR</td><td>Manager</td><td>John</td></tr>
            <tr><td rowspan="2">Employee</td><td>Jim</td></tr>
            <tr><td>Joe</td></tr>
        </tbody>
    </table>
</div>

目前 antd 的 Table 组件 API 并不包含自动合并的功能，需要开发人员自己写相应的 column 的 render 函数，实现方式也略为复杂。以下给出一个封装后的 MyTable 组件，可以自动合并用户期望合并的列。

用法非常简单，只需要在 columns 参数里面在对应的列上增加一个 mergeAbove 为 true 的属性就可以了，其余属性和原 Table 组件是一样的。示例代码如下：

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import MyTable from './my-table';

function App() {
    const columns = [
        {title: 'Department', dataIndex: 'department', mergeAbove: true},        
        {title: 'Role', dataIndex: 'role', mergeAbove: true},
        {title: 'Name', dataIndex: 'name'}
    ];
    const dataSource = [
        {department: 'IT', role: 'Manager', name: 'Jack'},
        {department: 'IT', role: 'Manager', name: 'Mike'},
        {department: 'IT', role: 'Employee', name: 'Tom'},
        {department: 'HR', role: 'Manager', name: 'John'},
        {department: 'HR', role: 'Employee', name: 'Jim'},
        {department: 'HR', role: 'Employee', name: 'Joe'},
    ];
    return <MyTable columns={columns} dataSource={dataSource} rowKey='name'/>;
}

ReactDOM.render(<App/>, document.getElementById('root'));
```

以下为 MyTable 组件的源码，基本思路是对传入的 columns 中 mergeAbove 属性为真的列的 render 函数进行改写，改写后的 render 函数会根据当前行所在的位置与相邻行的值进行对比，并根据位置及对比情况返回 rowSpan 为 0 或者合并行数 n 的属性。最后将改写后的新 columns 以及其他属性传递给 Table 组件。以此实现列的自动合并。

此外，为避免每次 update 时都重新计算新的 columns ，利用了 memoize-one 库对计算新 columns 的函数进行了包装，包装后的函数会记住它被调用时传入的参数以及计算结果，如果下一次调用时传入函数参数不变，那么会直接返回上一次调用的计算结果。（当然在 componentWillReceiveProps 进行判断再重新计算也可以，但使用 memoize 使代码更加清晰，是 react 开发团队更建议的方式）。

```javascript
// my-table.js

import React, { Component } from 'react';
import { Table } from 'antd';
import memoize from 'memoize-one';

export default class MyTable extends Component {
    buildNewColumns = memoize((columns, pageSize) => {
        return columns.map(column => {
            const { mergeAbove, render: originRender, dataIndex } = column;
            if (!mergeAbove) {
                return column;
            }
            const render = (value, row) => {
                const { dataSource: data } = this.props;

                // 当有分页时，antd 传递进来的第三个参数行索引 index 是错的，因此
                // 用 findIndex 找到正确的行索引，要求 data 里面不得出现两个相同
                // 的行（一般不会出现这种情况）。
                const i = data.findIndex(r => r === row); 

                const _i = i % pageSize;
                if (_i > 0 && value === data[i - 1][dataIndex]) {
                    var children = null;
                    var rowSpan = 0;
                } else {
                    children = originRender
                        ? originRender(value, row, i)
                        : value;
                    const nextI = Math.min(i - _i + pageSize, data.length);
                    for (
                        var ii = i + 1;
                        ii < nextI && value === data[ii][dataIndex];
                        ii++
                    ) ;
                    rowSpan = ii - i;
                }
                return { children, props: { rowSpan } };
            };
            return { ...column, render };
        });
    })

    render() {
        const { props, buildNewColumns } = this;
        const { columns, pagination } = props;
        const pageSize = getPageSize(pagination);
        const newColumns = buildNewColumns(columns, pageSize);
        return <Table {...props} columns={newColumns}/>;
    }
}

function getPageSize(pagination) {
    if (!pagination) {
        return 100000;
    }
    if (typeof(pagination) === 'object') {
        return pagination.pageSize || 10;
    }
    return 10;
}
```

以上封装方式其实也略嫌复杂，这主要是因为 Table 组件中 columns 中每列的 render 函数只传入了： value（当前值）、row（当前行） 以及 index（当前行索引） 这三个参数，开发人员可以在这个函数中使用当前单元格的数据、当前行的所有数据、以及当前行的位置这三个信息，但开发人员无法知道当前单元格位于哪一列，以及当前单元格相邻行的信息，其实很多场景下都需要这些信息（本文自动合并功能就是一个很典型的例子），如果 render 函数还可以传入： dataIndex（当前列索引） 和 dataSource（当前数据） 这两个参数，那本文的自动合并的功能其实可以很简单的实现，只需要给需要合并的列设置一个简单的 render 函数就可以了，而不需要像本文所用的方法这样对 Table 组件进行封装，对 columns 的 render 函数进行改写，以保证该 render 函数可以访问到当前的 dataSource 。
 