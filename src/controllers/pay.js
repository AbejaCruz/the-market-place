const mysql = require("mysql");


const db = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.process = (req, resul) => {
    const {
        name,
        type,
        quantity,
        total,
        id_s,
        id_b,
        id_p
    } = req.body;

    db.query(`SELECT stock FROM  products WHERE id_p=${id_p}`, (err, res) => {
        if (res[0].stock > 0) {
            db.query('INSERT INTO payments SET ?', {
                name_pa: name,
                type_pa: type,
                quantity: quantity,
                total: total
            }, (error, results) => {
                if (error) {
                    console.log(error);
                } else {
                    const id_payment = results.insertId;
                    db.query('INSERT INTO buys SET ?', {
                        user_seller: id_s,
                        user_buyer: id_b,
                        product_b_fk: id_p,
                        payment_fk: id_payment
                    }, (error, results) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log("dato insertado tabla buys");
                            db.query(`UPDATE products SET stock=stock - ${quantity} WHERE id_p=${id_p}`, (error, results) => {
                                console.log("stock actualizado")
                                return resul.json({
                                    "status": 200,
                                    "message:": 'Payment registered',
                                });

                            });

                        }

                    });

                }

            });
        } else {
            return resul.json({
                "error": {
                    "message": 'No stock available'
                }
            });
        }
    });
}