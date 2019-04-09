let a = [1,2,3,4]
let b = a.splice(0,2)

console.log(a);
console.log(b);

SELECT first_name AS "firstName", last_name AS "lastName", email, city, url AS "userUrl", age, id_user, id_sig
            FROM signatures
            LEFT JOIN profiles
            ON signatures.id_user_fkey = profiles.id_user_fkey
            LEFT JOIN users
            ON signatures.id_user_fkey = users.id_user;
