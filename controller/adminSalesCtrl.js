
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

        // const currentDate = new Date();
        // let filterDate;

        // filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

        // console.log("filter date is",filterDate);
        // sales = await Sales.find({ date: { $gte: filterDate } }).sort({ date: -1 });

        const sales = await Sales.find().sort({deliverTime:-1});

        res.render("adminSales",{sales});

    }catch(error){
        console.log(error);
    }
};

const filterAdminSalesManagement = async(req,res)=>{
    try{


        console.log("admin sales management is working now..");
        console.log(req.body);
        
        

        const { filter, startDate, endDate } = req.body;
        let sales;
    
        if (filter === 'dateRange') {

            console.log("start date is",startDate);
            console.log("start date is",endDate);

            
            sales = await Sales.find({
                deliveredDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate),
                },
            }).sort({ deliveredDate: -1 });

            console.log("sales is ",sales);
        } else {
            const currentDate = new Date();
            let filterDate;
    
            switch (filter) {
                case 'today':
                    filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

                    console.log("filter date is ",filterDate);
                    
                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    console.log("sales is ",sales);
                    break;
                case 'thisWeek':
                    filterDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

                    console.log("filter date is ",filterDate);

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });

                    console.log("sales is ",sales);
                    break;
                case 'thisMonth':
                    filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                    console.log("filter date is ",filterDate);

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    console.log("sales is ",sales);
                    break;
                case 'thisYear':
                    filterDate = new Date(currentDate.getFullYear(), 0, 1);

                    console.log("filter date is ",filterDate);

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    console.log("sales is ",sales);
                    break;
                default:
                    sales = await Sales.find().sort({ deliveredDate: -1 });
            }
        }

        res.json({success: true,sales, filter });
    
        // res.render('adminSales', { sales, filter });

    }catch(error){
        throw error;
    }
};

const downloadPdf = async (req, res) => {
    try {
        const filter = req.body.filter;
        
        // Assuming you handle the filter logic here
        const sales = await Sales.find().sort({ deliveredDate: -1 }); // Modify the query according to your filter logic

        console.log("download pdf is working and sales is ",sales);
        // Create a new PDF document
        const doc = new PDFDocument({size: 'A4',margin:25});
        
        // Stream the PDF directly to the response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="sales-report.pdf"');
        
        doc.pipe(res);

        doc.fontSize(22).text('BRANDHOME', {
            align: 'left'
        });
        doc.moveDown();

        // Add content to the PDF
        doc.fontSize(18).text('Sales Report', {
            align: 'center'
        });
        doc.moveDown(2);

        // Table Header
        const tableTop = 150;
        const rowHeight = 20;
        const columnWidths = {
            no: 40,
            date: 80,
            orderId: 150,
            item: 150,
            quantity: 40,
            amount: 140
        };

        let tableLeft = doc.page.margins.left;
        const tableRight = doc.page.width - doc.page.margins.right - columnWidths.amount; 


        // Draw the headers
        doc.fontSize(8);
        doc.text('No', tableLeft, tableTop);
        doc.text('Date', tableLeft + columnWidths.no, tableTop);
        doc.text('Order ID', tableLeft + columnWidths.no + columnWidths.date, tableTop);
        doc.text('Item', tableLeft + columnWidths.no + columnWidths.date + columnWidths.orderId, tableTop);
        doc.text('Quantity', tableLeft + columnWidths.no + columnWidths.date + columnWidths.orderId + columnWidths.item, tableTop);
        doc.text('Amount', tableRight, tableTop, { align: 'right' }); 


        // Draw the rows
        let rowTop = tableTop + rowHeight;
        let No = 1;

        sales.forEach((sale) => {
            doc.text(No, tableLeft, rowTop);
            doc.text(new Date(sale.deliveredDate).toLocaleDateString(), tableLeft + columnWidths.no, rowTop);
            doc.text(sale.orderObjectId, tableLeft + columnWidths.no + columnWidths.date, rowTop);
            doc.text(sale.purchaseDetails.productName, tableLeft + columnWidths.no + columnWidths.date + columnWidths.orderId, rowTop);
            doc.text(sale.purchaseDetails.quantity, tableLeft + columnWidths.no + columnWidths.date + columnWidths.orderId + columnWidths.item, rowTop);
            doc.text(`Rs ${sale.purchaseDetails.price}`, tableRight, rowTop, { align: 'right' });
            
            No++;
            rowTop += rowHeight;

            // If the row goes beyond the page height, add a new page
            if (rowTop > doc.page.height - doc.page.margins.bottom - rowHeight) {
                doc.addPage();
                rowTop = tableTop;
            }
        });

        doc.moveDown(3);
        var total = 0;
         for(let sale of sales ){
            total += sale.purchaseDetails.price;
        };
        doc.fontSize(12).text(`TOTAL  : ${total}`,  tableRight, rowTop, { align: 'right' });
        

        // Finalize the PDF
        doc.end();
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Failed to generate PDF.");
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