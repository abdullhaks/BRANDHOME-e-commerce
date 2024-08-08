
const Product = require("../models/productmodel");
const Stock = require("../models/stockModel");







const loadStockManagement = async(req,res)=>{
    try{

        const page = parseInt(req.query.page) || 1; // Default to page 1
        const pageSize = 7; // Number of products per page

        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / pageSize);

        const products = await Product.find()
        .sort({productName:1})
        .limit(pageSize)
        .skip((page - 1) * pageSize);


        return res.render("adminStockManagement",{products,currentPage:page, totalPages});

    }catch(error){
        console.log(error);
    }
};


const loadProductStocks = async(req,res)=>{
    try{
        
        const productId = req.params.productId;
        console.log("product name is "+productId)

        const products = await Product.findOne({_id:productId});
        console.log("product details is "+products)

        const stocks = await Stock.find({productId:products._id});
        console.log("stocks are "+stocks);

        return res.render("adminProductStocks",{stocks,products});



    }catch(error){
        console.log(error);
    }
};

const addStock = async (req, res) => {
    try {
        const productId = req.params.productId;
        const stocks = await Stock.find({ productId: productId });
        console.log("stocks are " + stocks);

        for (let i = 0; i < stocks.length; i++) {
            const stockId = stocks[i]._id;
            console.log("stock id is " + stockId);

            const stockToAdd = parseInt(req.body[`stock_${stockId}`]); // Parse input to integer

            console.log("stock is " + stockToAdd);
            
            if (!isNaN(stockToAdd) && stockToAdd > 0) {
                await Stock.updateOne({ _id: stockId }, { $inc: { stock: stockToAdd } });

                await Product.updateOne({ _id: productId }, { $inc: { totalStock: stockToAdd } });
            }
        }

        return res.redirect("/admin/stockManagement");
        
    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    loadStockManagement,
    loadProductStocks,
    addStock
}