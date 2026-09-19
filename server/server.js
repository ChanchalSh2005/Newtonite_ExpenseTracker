import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());

const expenseSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    minlength: [2, 'Title must be at least 2 characters long'] 
  },
  amount: { 
    type: Number, 
    required: [true, 'Amount is required'], 
    min: [0.01, 'Amount must be greater than 0'] 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'], 
    enum: ['food', 'travel', 'bills', 'shopping', 'other'] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const Expense = mongoose.model('Expense', expenseSchema);


app.post('/api/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


app.get('/api/expenses', async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const expenses = await Expense.find(query).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
});


app.get('/api/expenses/summary', async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { _id: 0, category: '$_id', total: 1 } }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Server error calculating summary' });
  }
});


app.delete('/api/expenses/:id', async (req, res) => {
  try {
   
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting expense' });
  }
});


mongoose.connect('mongodb+srv://neuralnet90_db_user:0EdZhWcDkSDBCusF@cluster0.hyfnbzu.mongodb.net')
  .then(() => {
    app.listen(5000, () => {
      console.log(`Server running on port 5000`);
    });
  })  
  .catch((err) => console.error('MongoDB connection error:', err));