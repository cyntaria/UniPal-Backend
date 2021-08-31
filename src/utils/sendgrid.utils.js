const sgMail = require('@sendgrid/mail');
const { Config } = require('../configs/config');
const { OTPGenerationException } = require('../utils/exceptions/auth.exception');

sgMail.setApiKey(Config.SENDGRID_API_KEY);

exports.sendOTPEmail = async(student, OTP) => {
    const msg = {
        to: student.email, // Change to your recipient
        from: Config.SENDGRID_SENDER, // Change to your verified sender
        subject: '3D-Secure OTP Notification',
        templateId: 'd-590b84200cdc4fdba9ad36a6cf22670e',
        dynamic_template_data: {full_name: `${student.first_name} ${student.last_name}`, OTP}
    };

    try {
        await sgMail.send(msg);
    } catch (err) {
        console.error(err);
        if (err.response) {
            console.error(err.response.body);
            throw new OTPGenerationException(err.message);
        }
    }
};