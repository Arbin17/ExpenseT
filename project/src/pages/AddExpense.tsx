import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses } from '../contexts/ExpenseContext';
import { useRoommates } from '../contexts/RoommateContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Tag, 
  Users, 
  Calendar, 
  FileText,
  ArrowLeft,
  Check
} from 'lucide-react';

function AddExpense() {
  const { addExpense } = useExpenses();
  const { roommates } = useRoommates();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(currentUser?.id || '');
  const [description, setDescription] = useState('');
  const [splitWith, setSplitWith] = useState<string[]>(roommates.map(r => r.id));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Groceries', 
    'Rent', 
    'Utilities', 
    'Internet', 
    'Streaming', 
    'Household', 
    'Entertainment', 
    'Transportation', 
    'Dining', 
    'Other'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    if (!paidBy) {
      newErrors.paidBy = 'Paid by is required';
    }
    
    if (splitWith.length === 0) {
      newErrors.splitWith = 'Select at least one person to split with';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    addExpense({
      title,
      amount: parseFloat(amount),
      category,
      date,
      paidBy,
      description,
      splitWith
    });
    
    navigate('/expenses');
  };

  const toggleRoommate = (id: string) => {
    setSplitWith(prev => {
      if (prev.includes(id)) {
        return prev.filter(roomieId => roomieId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6">
      <motion.div 
        className="md:flex md:items-center md:justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-w-0 flex-1">
          <button
            onClick={() => navigate('/expenses')}
            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500 mb-2"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to expenses
          </button>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Add New Expense
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Record a new shared expense to split with roommates
          </p>
        </div>
      </motion.div>

      <div className="mt-6 md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Expense Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Fill in the details of the expense and select who to split it with.
            </p>
            
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h4 className="text-md font-medium text-gray-900">Tips:</h4>
              <ul className="mt-2 text-sm text-gray-500 list-disc pl-5 space-y-1">
                <li>Be specific with the expense title</li>
                <li>Select the correct date when the expense occurred</li>
                <li>Make sure to select all roommates who should share this expense</li>
                <li>Add a description for clarity if needed</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit}
          >
            <div className="shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 bg-white sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Expense Title
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="title"
                        className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                          errors.title 
                            ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
                            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        placeholder="e.g., Grocery Shopping, Electric Bill"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    {errors.title && (
                      <p className="mt-2 text-sm text-error-600">{errors.title}</p>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="amount"
                        className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                          errors.amount 
                            ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
                            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-2 text-sm text-error-600">{errors.amount}</p>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="category"
                        className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        id="date"
                        className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                          errors.date 
                            ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
                            : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                        }`}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    {errors.date && (
                      <p className="mt-2 text-sm text-error-600">{errors.date}</p>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700">
                      Paid By
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="paidBy"
                        className={`block w-full pl-10 pr-10 py-2 text-base ${
                          errors.paidBy 
                            ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
                            : 'border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
                        } sm:text-sm rounded-md`}
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                      >
                        <option value="">Select who paid</option>
                        {roommates.map((roommate) => (
                          <option key={roommate.id} value={roommate.id}>
                            {roommate.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.paidBy && (
                      <p className="mt-2 text-sm text-error-600">{errors.paidBy}</p>
                    )}
                  </div>

                  <div className="col-span-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description (Optional)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        id="description"
                        rows={3}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Any additional details about this expense..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="col-span-6">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Split With
                      </label>
                      <button
                        type="button"
                        className="text-xs text-primary-600 hover:text-primary-500"
                        onClick={() => setSplitWith(roommates.map(r => r.id))}
                      >
                        Select all
                      </button>
                    </div>
                    {errors.splitWith && (
                      <p className="mt-2 text-sm text-error-600">{errors.splitWith}</p>
                    )}
                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {roommates.map((roommate) => (
                        <div 
                          key={roommate.id} 
                          className={`relative rounded-lg border p-4 flex items-center cursor-pointer ${
                            splitWith.includes(roommate.id)
                              ? 'bg-primary-50 border-primary-200'
                              : 'border-gray-200'
                          }`}
                          onClick={() => toggleRoommate(roommate.id)}
                        >
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                            splitWith.includes(roommate.id)
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {roommate.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              splitWith.includes(roommate.id) ? 'text-primary-700' : 'text-gray-700'
                            }`}>
                              {roommate.name}
                            </p>
                            <p className="text-xs text-gray-500">{roommate.email}</p>
                          </div>
                          {splitWith.includes(roommate.id) && (
                            <div className="absolute top-2 right-2">
                              <Check className="h-5 w-5 text-primary-500" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  onClick={() => navigate('/expenses')}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Save Expense
                </motion.button>
              </div>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

export default AddExpense;