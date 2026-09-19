import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api/expenses';
const CATEGORIES = ['food', 'travel', 'bills', 'shopping', 'other'];

function App() {
 
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
 
  const [filter, setFilter] = useState('');
  
 
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [formError, setFormError] = useState('');


  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      
      const url = filter ? `${API_URL}?category=${filter}` : API_URL;
      
      const [expensesRes, summaryRes] = await Promise.all([
        fetch(url),
        fetch(`${API_URL}/summary`)
      ]);
      
      if (!expensesRes.ok || !summaryRes.ok) throw new Error('Failed to fetch data');
      
      setExpenses(await expensesRes.json());
      setSummary(await summaryRes.json());
    } catch (err) {
   
      setError('Error communicating with the server.');
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchData();
  }, [filter]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount: Number(amount), category })
      });
      
      const data = await res.json();
      
     
      if (!res.ok) throw new Error(data.error || 'Failed to add expense');
      
    
      setTitle('');
      setAmount('');
      setCategory('food');
      
    
      fetchData(); 
    } catch (err) {
      setFormError(err.message);
    }
  };

  
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      
     
      fetchData(); 
    } catch (err) {
      setError(err.message);
    }
  };

  const grandTotal = summary.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mini Expense Tracker</h1>
      
      {}
      {error && <div style={{ background: '#ffcccc', padding: '10px', color: 'red', marginBottom: '15px' }}>{error}</div>}
      
      {}
      <section style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px' }}>
        <h2>Add Expense</h2>
        {formError && <p style={{ color: 'red', fontSize: '14px' }}>{formError}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" placeholder="Title" value={title} 
            onChange={e => setTitle(e.target.value)} required 
          />
          <input 
            type="number" placeholder="Amount" step="0.01" value={amount} 
            onChange={e => setAmount(e.target.value)} required 
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" style={{ cursor: 'pointer' }}>Add Expense</button>
        </form>
      </section>

      {}
      <section style={{ marginBottom: '20px' }}>
        <h2>Summary</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {summary.map(s => (
            <div key={s.category} style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
              <strong>{s.category}: </strong> ${s.total.toFixed(2)}
            </div>
          ))}
          <div style={{ background: '#d4edda', padding: '10px', borderRadius: '5px' }}>
            <strong>Grand Total: </strong> ${grandTotal.toFixed(2)}
          </div>
        </div>
      </section>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Expenses</h2>
          {}
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '5px' }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {}
        {loading ? (
          <p>Loading...</p>
        ) : expenses.length === 0 ? (
          <p>No expenses yet</p>
        ) : (
         
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', background: '#f9f9f9' }}>
                <th style={{ padding: '8px' }}>Title</th>
                <th style={{ padding: '8px' }}>Amount</th>
                <th style={{ padding: '8px' }}>Category</th>
                <th style={{ padding: '8px' }}>Date</th>
                <th style={{ padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{exp.title}</td>
                  <td style={{ padding: '8px' }}>${exp.amount.toFixed(2)}</td>
                  <td style={{ padding: '8px' }}>{exp.category}</td>
                  <td style={{ padding: '8px' }}>{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '8px' }}>
                    {/* Requirement 2: Delete button[cite: 1] */}
                    <button onClick={() => handleDelete(exp._id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;