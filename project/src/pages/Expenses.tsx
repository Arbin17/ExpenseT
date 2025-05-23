import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExpenses, Expense } from '../contexts/ExpenseContext';
import { useRoommates } from '../contexts/RoommateContext';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Filter, 
  Search, 
  Tag, 
  Trash2, 
  Calendar,
  Users,
  Check,
  X
} from 'lucide-react';

function Expenses() {
  const { expenses, deleteExpense } = useExpenses();
  const { roommates, getRoommateById } = useRoommates();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>(expenses);
  const [categories, setCategories] = useState<string[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    // Extract unique categories
    const uniqueCategories = Array.from(new Set(expenses.map(expense => expense.category)));
    setCategories(['All', ...uniqueCategories]);

    // Apply filters
    let results = [...expenses];
    
    // Apply search term filter
    if (searchTerm) {
      results = results.filter(expense => 
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'All') {
      results = results.filter(expense => expense.category === categoryFilter);
    }
    
    // Sort by date (newest first)
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredExpenses(results);
  }, [expenses, searchTerm, categoryFilter]);

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
    setShowConfirmDelete(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pb-6">
      <motion.div 
        className="md:flex md:items-center md:justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Expenses
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track all your shared expenses
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/expenses/add')}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add expense
          </motion.button>
        </div>
      </motion.div>

      <div className="mt-6 md:flex md:items-center md:justify-between">
        <div className="relative rounded-md shadow-sm max-w-lg w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="mt-3 md:mt-0 flex items-center">
          <Filter className="mr-2 h-5 w-5 text-gray-400" />
          <span className="mr-2 text-sm text-gray-500">Category:</span>
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-6"
      >
        {filteredExpenses.length > 0 ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Expense
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Paid By
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Amount
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredExpenses.map((expense) => {
                  const paidBy = getRoommateById(expense.paidBy);
                  return (
                    <motion.tr key={expense.id} variants={itemVariants}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{expense.title}</div>
                        {expense.description && (
                          <div className="text-gray-500 truncate max-w-xs">{expense.description}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                          {format(parseISO(expense.date), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          <Tag className="mr-1 h-3 w-3" />
                          {expense.category}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 mr-2">
                            {paidBy?.name.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span>{paidBy?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium">
                        Rs{expense.amount.toFixed(2)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        {showConfirmDelete === expense.id ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-error-500 hover:text-error-700"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setShowConfirmDelete(null)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowConfirmDelete(expense.id)}
                            className="text-gray-400 hover:text-error-500"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <div className="flex flex-col items-center">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || categoryFilter !== 'All' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Get started by adding a new expense'}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/expenses/add')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add expense
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Expenses;