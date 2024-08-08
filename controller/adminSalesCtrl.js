
const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressmodel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const Orders = require("../models/orderModel");
const Returns = require("../models/returnModel");
const Category = require("../models/categorymodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mail = require("../middleware/mail");
const Sales = require ("../models/salesModel");
const PDFDocument = require('pdfkit');
const excel = require('exceljs');



const loadAdminSalesManagement = async(req,res)=> {
    try{

        const currentDate = new Date();
        let filterDate;

        filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

        console.log("filter date is",filterDate);
        sales = await Sales.find({ date: { $gte: filterDate } }).sort({ date: -1 });

        const sales = await Sales.find().sort({deliverTime:-1});

        res.render("adminSales",{sales});

    }catch(error){
        console.log(error);
    }
};

const filterAdminSalesManagement = async(req,res)=>{
    try{

    }catch(error){
        throw error;
    }
};

const downloadPdf = async(req, res )=>{
    try{
        const sales = await Sales.find().sort({ date: -1 });
        const doc = new PDFDocument();
    
        doc.pipe(fs.createWriteStream('sales-report.pdf'));
        doc.text('Sales Report');
        sales.forEach(sale => {
            doc.text(`${sale.date}: ${sale.amount}`);
        });
        doc.end();
    
        res.download(path.join(__dirname, '..', 'sales-report.pdf'));

    }catch(error){
        throw error;
    }
};

const downloadXl = async(req,res)=>{
    try{

        const sales = await Sales.find().sort({ date: -1 });
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
    
        worksheet.columns = [
            { header: 'Date', key: 'date', width: 30 },
            { header: 'Amount', key: 'amount', width: 30 },
        ];
    
        sales.forEach(sale => {
            worksheet.addRow({ date: sale.date, amount: sale.amount });
        });
    
        const filePath = path.join(__dirname, '..', 'sales-report.xlsx');
        await workbook.xlsx.writeFile(filePath);
        res.download(filePath);

    }catch(error){
        throw error;
    };
}


module.exports = {
    loadAdminSalesManagement,
    filterAdminSalesManagement,
    downloadPdf,
    downloadXl,
    

}