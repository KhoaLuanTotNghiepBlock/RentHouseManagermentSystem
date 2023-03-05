const axios = require("axios");

// const getCity = async (nameCity) => {
//     let data;
//     await axios.get(`https://jsonmock.hackerrank.com/api/countries?name=${nameCity}`)
//         .then((response) => data = response.data)
//         .catch((error) => console.log(error));

//     if (data.data.length === 0) {
//         return '-1';
//     }
//     console.log("🚀 ~ file: edotor.js:5 ~ getCity ~ data:", data.data[0].capital)

//     return data.data[0].capital;
// }

// getCity("Afghanistan");

const getDataByPage = async (page) => {
    let data;

    await axios.get(`https://jsonmock.hackerrank.com/api/tvseries?page=${page}`)
        .then((response) => data = response.data)
        .catch((error) => console.log(error));
    return data;
}
const getGenreByData = async (genre) => {
    let page = 1;
    const listGenre = [];
    while (true) {
        const { data, total_pages } = await getDataByPage(page);

        if (total_pages < page) {
            break;
        }

        for (let i = 0; i < data.length; i++) {
            const genres = data[i].genre.split(',');
            if (genres.includes(genre))
                listGenre.push(data[i]);
        }
        page++;
    }

    return listGenre;
}
async function bestInGenre(genre) {
    const genres = await getGenreByData(genre);
    if (!genres || genres.length === 0)
        return '';

    const highestRate = genres.reduce((highest, current) => {
        return highest.imdb_rating > current.imdb_rating ? highest : current;
    });

    console.log("🚀 ~ file: edotor.js:57 ~ bestInGenre ~ highestRate.name:", highestRate.name)
    return highestRate.name;
}


bestInGenre('Comedy')


// const getDataByPage = async (page) => {
//     let data;

//     await axios.get(`https://jsonmock.hackerrank.com/api/universities?page=${page}`)
//         .then((response) => data = response.data)
//         .catch((error) => console.log(error));
//     return data;
// }

// async function highestInternationalStudents(firstCity, secondCity) {
//     let page = 1;
//     const listFirstCity = [];
//     const sercondCitys = [];
//     let highestInternationalStudent = null;
//     while (true) {
//         const { data, total_pages } = await getDataByPage(page);
//         if (total_pages < page) {
//             break;
//         }

//         for (let i = 0; i < data.length; i++) {
//             if (data[i].location.city === firstCity)
//                 listFirstCity.push(data[i])
//             else if (data[i].location.city === secondCity)
//                 sercondCitys.push(data[i]);
//         }
//         page++;
//     }
//     if (listFirstCity) {
//         highestInternationalStudent = listFirstCity.reduce((highest, current) => {
//             return highest.international_students > current.international_students ? highest : current;
//         });
//     }

//     if (highestInternationalStudent == null || !highestInternationalStudent)
//         highestInternationalStudent = sercondCitys.reduce((highest, current) => {
//             return highest.international_students > current.international_students ? highest : current;
//         });

//     console.log("🚀 ~ file: edotor.js:100 ~ highestInternationalStudents ~ highestInternationalStudent.university:", highestInternationalStudent.university)

//     return highestInternationalStudent.university;

// }
// highestInternationalStudents('Princeton', 'London');


// const crypto = require('../../utils/crypto.hepler');
// // Sample JSON object
// const json = {
//     name: 'John Doe',
//     age: 30,
//     email: 'johndoe@example.com'
// };

// // Convert JSON to string
// const jsonString = JSON.stringify(json);

// const hash = crypto.hash(jsonString);

// if (crypto.match(hash, jsonString))
//     console.log(' string is match')
// const fs = require('fs').promises;
// const sourceCode = fs.readFile('src/api/user/blockchain/contract/BHRentalContract.sol', 'utf8');
// console.log("🚀 ~ file: edotor.js:128 ~ sourceCode:", sourceCode)
