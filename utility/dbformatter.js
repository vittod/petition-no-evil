
exports.formatSigs = (rows, delCity) => {
    return rows
        .map(el => {
        if (delCity) {
            delete el.city
        }
        el.created_at = new Date(el.created_at);
        el.age = filterAge(el.age);
        return el
    })
        .sort(sortByDate)
        .map(el => {
            el.created_at = `signed ${el.created_at.getMonth()}/${el.created_at.getDate()}/${el.created_at.getFullYear()}`;
            return el
        })
}


function filterAge(age) {
    if (age === 0 || age === null) {
        age = ''
    }
    return age
}
function sortByDate(a, b) {
    return a.created_at - b.created_at
}



//
//
// sigs.rows.forEach(el => {
//     sigDate = new Date(el.created_at);
//     el.created_at = `signed ${sigDate.getMonth()}/${sigDate.getDate()}/${sigDate.getFullYear()}`;
//     if (el.age === 0 || el.age === null) {
//         el.age = ''
//     }
// })
//
//
//
// sigs.rows.forEach(el => {
//     delete el.city;
//     let sigDate = new Date(el.created_at);
//     el.created_at = `signed ${sigDate.getMonth()}/${sigDate.getDate()}/${sigDate.getFullYear()}`;
//     if (el.age === 0 || el.age === null) {
//         el.age = ''
//     }
//     return el;
// })

// var ex = [
//     {
//         id: 1,
//         age: 3,
//         city: 'ber',
//         created_at: '2019-04-09 22:47:31.900399+02'
//     },
//     {
//         id: 2,
//         age: null,
//         city: 'hei',
//         created_at: '2019-04-10 00:22:19.834368+02'
//     }
// ]
// console.log(formatSigs(ex, true));
