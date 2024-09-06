
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
        const filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

        console.log("filter date is ",filterDate);
        
        const sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
        const filter = "today"

        res.render("adminSales",{sales,filter});

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const filterAdminSalesManagement = async(req,res)=>{
    try{


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

           
        } else {
            const currentDate = new Date();
            let filterDate;
    
            switch (filter) {
                case 'today':
                    filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

                    console.log("filter date is ",filterDate);
                    
                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    
                    break;
                case 'thisWeek':
                    filterDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

                    console.log("filter date is ",filterDate);

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });

                    console.log("sales is ",sales);
                    break;
                case 'thisMonth':
                    filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                   

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    console.log("sales is ",sales);
                    break;
                case 'thisYear':
                    filterDate = new Date(currentDate.getFullYear(), 0, 1);

                

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                  
                    break;
                default:
                    sales = await Sales.find().sort({ deliveredDate: -1 });
            }
        }

        res.json({success: true,sales, filter });
    
        // res.render('adminSales', { sales, filter });

    }catch(error){
        console.log(error);
        res.render("adminSideErrors");
    }
};

const downloadPdf = async (req, res) => {
    try {
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

           
        } else {
            const currentDate = new Date();
            let filterDate;
    
            switch (filter) {
                case 'today':
                    filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

                    console.log("filter date is ",filterDate);
                    
                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    
                    break;
                case 'thisWeek':
                    filterDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

                    console.log("filter date is ",filterDate);

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });

                    console.log("sales is ",sales);
                    break;
                case 'thisMonth':
                    filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                   

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    console.log("sales is ",sales);
                    break;
                case 'thisYear':
                    filterDate = new Date(currentDate.getFullYear(), 0, 1);

                

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                  
                    break;
                default:
                    sales = await Sales.find().sort({ deliveredDate: -1 });
            }
        }
     
        // Create a new PDF document
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        
        // Stream the PDF directly to the response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="sales-report.pdf"');
        
        doc.pipe(res);

        doc.fontSize(22).font('Helvetica-Bold').text('BRANDHOME', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica').text('Sales Report', { align: 'center', underline: true });
        doc.moveDown(2);

        // Table Header
        const tableTop = 200;
        const rowHeight = 25;
        const columnWidths = { no: 40, date: 60, orderId: 140, item: 180, quantity: 50, amount: 80 };
        

        let tableLeft = doc.page.margins.left;
        const tableRight = doc.page.width - doc.page.margins.right - columnWidths.amount; 


        // Draw the headers
        doc.fontSize(10).font('Helvetica-Bold')
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
            doc.fontSize(10).font('Helvetica');
            doc.text(No, tableLeft, rowTop);
            doc.text(new Date(sale.deliveredDate).toLocaleDateString(), tableLeft + columnWidths.no, rowTop);
            doc.text(sale.orderId, tableLeft + columnWidths.no + columnWidths.date, rowTop);
            doc.text(sale.item.productName, tableLeft + columnWidths.no + columnWidths.date + columnWidths.orderId, rowTop);
            doc.text(sale.item.quantity, tableLeft + columnWidths.no + columnWidths.date + columnWidths.orderId + columnWidths.item, rowTop);
            doc.text(` ${sale.item.payAmount}`, tableRight, rowTop, { align: 'right' });
            
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
            total += sale.item.payAmount;
        };
        doc.fontSize(12).font('Helvetica-Bold').text(`TOTAL: Rs ${total}`, { align: 'right' });

        doc.moveDown(2);
        doc.fontSize(12).font('Helvetica-Bold').text('Summary', { underline: true });
        doc.moveDown(1);
        
        const endDate4s = sales[0].deliveredDate.toLocaleDateString();
        const startDate4s = sales[sales.length-1].deliveredDate.toLocaleDateString();
        
        doc.fontSize(10).font('Helvetica').text(`The sales report from ${startDate4s} to ${endDate4s} shows a total of ${sales.length} transactions with total revenue of Rs ${total}. The average revenue per sale was Rs ${(total / sales.length).toFixed(2)}.`, { align: 'justify' });
        
        doc.moveDown();
        doc.fontSize(10).font('Helvetica').text('Generated by BRANDHOME Sales System', 40, doc.page.height - 50, { align: 'center' });

        // Finalize the PDF
        doc.end();
        
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Failed to generate PDF.");
    }
};


const downloadXl = async (req, res) => {
    try {
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

           
        } else {
            const currentDate = new Date();
            let filterDate;
    
            switch (filter) {
                case 'today':
                    filterDate = new Date(currentDate.setHours(0, 0, 0, 0));

                    console.log("filter date is ",filterDate);
                    
                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    
                    break;
                case 'thisWeek':
                    filterDate = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

                    console.log("filter date is ",filterDate);

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });

                    console.log("sales is ",sales);
                    break;
                case 'thisMonth':
                    filterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

                   

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                    console.log("sales is ",sales);
                    break;
                case 'thisYear':
                    filterDate = new Date(currentDate.getFullYear(), 0, 1);

                

                    sales = await Sales.find({ deliveredDate: { $gte: filterDate } }).sort({ deliveredDate: -1 });
                  
                    break;
                default:
                    sales = await Sales.find().sort({ deliveredDate: -1 });
            }
        }

        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Order ID', key: 'orderId', width: 30 },
            { header: 'Item', key: 'item', width: 30 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Amount', key: 'amount', width: 15 },
        ];

        sales.forEach(sale => {
            worksheet.addRow({
                date: new Date(sale.deliveredDate).toLocaleDateString(),
                orderId: sale.orderId,
                item: sale.item.productName,
                quantity: sale.item.quantity,
                amount: sale.item.payAmount,
            });
        });

        
        var total = 0;
         for(let sale of sales ){
            total += sale.item.payAmount;
        };
       

        worksheet.addRow({

        });
      const totalRow =  worksheet.addRow([null,null, null, null,`TOTAL :${total}`]); 

      totalRow.eachCell((cell) => {
        cell.font = {
            name: 'Arial',
            size: 12,
            bold: true,
        };

        totalRow.commit();
    });


        // Create buffer and send it directly as a response
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'sales-report.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Error generating Excel file:", error);
        res.status(500).send('Error generating Excel file');
    }
};


module.exports = {
    loadAdminSalesManagement,
    filterAdminSalesManagement,
    downloadPdf,
    downloadXl,
    

}