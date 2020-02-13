var Imap = require('imap');

var imap = new Imap({
    user: process.env['MAIL_RECIPIENT'] ,
    password: process.env['MAIL_RECIPIENT_PASSWORD'],
    host: process.env['MAIL_SERVER_IMAP'],
    port: process.env['MAIL_PORT_IMAP'],
    tls: !!process.env['MAIL_IMAP_SECURE']
});

function openBox(cb) {
    imap.openBox('INBOX', true, cb);
}

var signUpEmailContent = 'WELCOME TO FYIPE\nHi John,\n\n I\'m Nawaz and I\'m the founder of Fyipe. I can\'t thank you enough for signing\nup. \n\nIf you need any help using Fyipe, Please Send us an email at support@fyipe.com\nand let me know.\n\nThanks, have a great day.\n\nFyipe Team';

var feedbackEmailContent = ' Fyipe [https://www.dropbox.com/s/dwawm02f1toxnm8/Fyipe-Icon.png?dl=0&raw=1]\n[http://localhost:1444] THANK YOU FOR YOUR FEEDBACK\nHi John, Thank you for your feedback. We’ll get back to you as soon as we can. \nHave a great day. Fyipe Team. © 2019 Fyipe Inc.';

var leadEmailContent = ' Fyipe [https://www.dropbox.com/s/dwawm02f1toxnm8/Fyipe-Icon.png?dl=0&raw=1] \nTHANK YOU FOR YOUR DEMO REQUEST.\nI am Nawaz and I\'m your account executive and excited to give you a demo. \nSchedule a call [https://calendly.com/nawazdhandala/call] If you need any help,\nSend us an email at support@fyipe.com [support@fyipe.com] and I\'ll be there to\nhelp. Thanks, have a great day. Nawaz Dhandala Account Executive Fyipe © 2019\nFyipe Inc.';

module.exports = {
    imap,
    openBox,
    signUpEmailContent,
    feedbackEmailContent,
    leadEmailContent
};