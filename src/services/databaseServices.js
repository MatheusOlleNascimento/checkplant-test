import {DatabaseConnection} from '../database/databaseConnection';

const table = "annotations";
const db=DatabaseConnection.getConnection();

export default class databaseServices {

    static addAnnotation(annotation) {
        return new Promise((resolve, reject) =>db.transaction(
            tx => {
                tx.executeSql(`insert into ${table}(
                    annotation,
                    longitude,
                    latitude,
                    sinc,
                    date) values('${annotation.annotation}', ${annotation.longitude}, ${annotation.latitude}, ${annotation.sinc}, '${annotation.date}');`,
                (_, { insertId, rows }) => {
                    resolve(insertId)
                }), (sqlError) => {
                    console.log(sqlError);
                }}, (txError) => {
                console.log(txError);
        }));
    }

    static findAll() {
        return new Promise((resolve, reject) => db.transaction(tx => {
            tx.executeSql(`select * from ${table}`, [], (_, { rows }) => {
                resolve(rows)
            }), (sqlError) => {
                console.log(sqlError);
            }}, (txError) => {
            console.log(txError);
        }))
    }


}