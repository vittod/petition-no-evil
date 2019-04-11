const uif = require('../../utility/userInputFormatter')

let inpStrArr = ['a<<b<"""&&c', 'd&e&<<f>>', "g'h<i>''"]
let resStrArr = ['abc', 'def', 'ghi']

let inpStrObj = {
    a: 'a<<b<"""&&c',
    b: 'd&e&<<f>>',
    c: "g'h<i>''"
}
let resStrObj = {
    a:'abc',
    b:'def',
    c:'ghi'
}

test('sanitizer takes array of strings', () => {
    expect(uif.sanitizer(inpStrArr)).toEqual(resStrArr)
})

test('sanitizer takes object of strings', () => {
    expect(uif.sanitizer(inpStrObj)).toEqual(resStrObj)
})

test('sanitizer takes string', () => {
    expect(uif.sanitizer(inpStrObj.a)).toEqual(resStrObj.a)
})

test('sanitizer takes array of misc', () => {
    expect(uif.sanitizer(inpStrArr.push(1))).toEqual(resStrArr.push(1))
})

test('sanitizer takes object of misc', () => {
    let miscObj = inpStrObj;
    miscObj.number = 1;
    let miscResObj = resStrObj;
    miscResObj.number = 1;
    console.log(uif.sanitizer(miscObj));
    expect(uif.sanitizer(miscObj)).toEqual(miscResObj)
})
