import { DatabaseConnection } from './databaseConnection'

var db = null

export default class DatabaseInit {
    
    constructor() {
        db = DatabaseConnection.getConnection();
        db.exec([{ sql: 'PRAGMA foreign_keys = ON;', args: [] }], false
    );
        this.InitDb();
    }
    InitDb() {
        var sql = [
            `DROP TABLE IF EXISTS annotations;`,

            `create table if not exists annotations (
            id integer primary key autoincrement,
            annotation text,
            longitude real,
            latitude real,
            sinc integer,
            date text
            );`,
         
            // `insert into annotations(
            //     annotation,
            //     longitude,
            //     latitude,
            //     sinc,
            //     date) values('MY HOME', -54.1189806, -31.3412984, 0, '2021-02-21 16:43:50');`,
        ];

        db.transaction(
            tx => {
                for (var i = 0; i < sql.length; i++) {
                    tx.executeSql(sql[i]);
                }
            }, (error) => {
                console.log("Error call back : " + JSON.stringify(error));
                console.log(error);
            }, () => {
                //console.log("Complete call back");
            }
        );
    }

}