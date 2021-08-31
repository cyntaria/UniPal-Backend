module.exports.Config = {
    NODE_ENV: process.env.NODE_ENV || 'dev',
    PORT: process.env.PORT || 3331,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_USER: process.env.DB_USER || 'root',
    DB_PASS: process.env.DB_PASS || '',
    DB_DATABASE: process.env.DB_DATABASE || 'test',
    SECRET_JWT: process.env.SECRET_JWT || "*Un1p4L*",
    EXPIRY_JWT: '3d',
    EXPIRY_HOURS_OTP: 1,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "SENDGRID_API_KEY",
    SENDGRID_SENDER: process.env.SENDGRID_SENDER || "FROM_EMAIL"
};