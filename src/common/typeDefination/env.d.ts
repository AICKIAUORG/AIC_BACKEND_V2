namespace NodeJS{
    interface ProcessEnv{
        //DB
        DB_NAME : string
        DB_PORT : number
        DB_HOST : string
        DB_USERNAME : string
        DB_PASSWORD : string
        //APPLICATION
        PORT : number
        //jwt
        ACCESS_TOKEN_SECRET : string
        REFRESH_TOKEN_SECRET : string
    }
}