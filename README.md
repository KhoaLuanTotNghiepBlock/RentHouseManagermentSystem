# entrance_test_nodejs_nexlesoft

## How to run 
`npm install || npm i`
<hr>
Run with role user: `npm run start-user`
Run with role admin: `npm run start-admin`

## API

### Auth `/bh/auth`
-   `[POST] /registry`: sign up.
    -   body: {
                    "name": "Đoàn Ngọc Quốc Bảo",
                    "username": "yonedoan",
                    "password": "123456789",
                    "contactInfo": "84972347165"
            }
    -   result: {
            "errorCode": 200,
            "message": "Account is create succesful",
            "data": {}
        }
-   `[POST] /login`: sign in.
    -   body: {
                "username": "canhcutcon",
                "password": "123456789"
            }
    -   result: {
                "message": "login success",
                "data": {
                    "accessToken": String
                    "refreshToken": String,
                    "user": {
                        "_id": "63c2c1646753d82e5c9826df",
                        "name": "Võ Thị Trà Giang",
                        "avatar": "",
                        "username": "canhcutcon"
                    }
                },
                "errorCode": 200
            }

-   `[POST] /confirm-account`: verify account by otp
    -   body: {
            "username": "yonedoan",
            "otp": "878484"
        }
    -   result: {
            "message": "Account confirm successful",
            "data": {},
            "errorCode": 200
        }
-   `[POST] /reset-otp`: resend otp
    -   body: {
            "username": "yonedoan",
        }
    -   result: {
             errorCode: 200,
             message: "OTP already send!",
            "errorCode": 200
        }

-   `[POST] /confirm-account`: verify account by otp
    -   body: {
            "username": "yonedoan",
            "otp": "878484"
        }
    -   result: {
            "message": "Account confirm successful",
            "data": {},
            "errorCode": 200
        }
