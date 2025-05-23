import { useState } from 'react';
import { useRoommates } from '../contexts/RoommateContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  UserPlus, 
  Mail, 
  Calendar, 
  Trash2, 
  Check, 
  X, 
  User,
  XCircle,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function Roommates() {
  const { roommates, addRoommate, removeRoommate, acceptInvitation, rejectInvitation } = useRoommates();
  const { currentUser } = useAuth();
  
  const [isAddingRoommate, setIsAddingRoommate] = useState(false);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [newRoommateEmail, setNewRoommateEmail] = useState('');
  const [errors, setErrors] = useState<{name?: string; email?: string}>({});
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: {name?: string; email?: string} = {};
    
    if (!newRoommateName.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!newRoommateEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newRoommateEmail)) {
      newErrors.email = 'Email is invalid';
    } else if (roommates.some(r => r.email === newRoommateEmail)) {
      newErrors.email = 'This email is already in use';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRoommate = () => {
    if (!validateForm()) {
      return;
    }
    
    addRoommate({
      name: newRoommateName,
      email: newRoommateEmail,
    });
    
    setNewRoommateName('');
    setNewRoommateEmail('');
    setIsAddingRoommate(false);
  };

  const handleCancelAdd = () => {
    setNewRoommateName('');
    setNewRoommateEmail('');
    setErrors({});
    setIsAddingRoommate(false);
  };

  const handleDeleteRoommate = (id: string) => {
    removeRoommate(id);
    setShowConfirmDelete(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-100 text-error-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const pendingInvites = roommates.filter(r => 
    r.status === 'pending' && r.id === currentUser?.id
  );

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
            Roommates
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your roommates for expense sharing
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingRoommate(true)}
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={isAddingRoommate}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Invite Roommate
          </motion.button>
        </div>
      </motion.div>

      {pendingInvites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white shadow sm:rounded-lg"
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Pending Invitations
            </h3>
            <div className="mt-4 space-y-4">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Invited by {roommates.find(r => r.id === invite.invitedBy)?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(invite.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptInvitation(invite.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => rejectInvitation(invite.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-error-500 hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {roommates.map((roommate) => (
          <motion.div
            key={roommate.id}
            variants={itemVariants}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
          >
            <div className="px-6 py-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-lg font-semibold">
                    {roommate.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    {roommate.name}
                    {roommate.id === currentUser?.id && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        You
                      </span>
                    )}
                  </h3>
                  <div className="mt-1">
                    {getStatusBadge(roommate.status)}
                  </div>
                </div>
                {roommate.id !== currentUser?.id && roommate.status === 'accepted' && (
                  <div>
                    {showConfirmDelete === roommate.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteRoommate(roommate.id)}
                          className="text-error-500 hover:text-error-700"
                          aria-label="Confirm delete"
                        >
                          <Check className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(null)}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label="Cancel delete"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowConfirmDelete(roommate.id)}
                        className="text-gray-400 hover:text-error-500"
                        aria-label="Remove roommate"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center text-sm text-gray-500">
                  <Mail className="flex-shrink-0 mr-2 h-4 w-4" />
                  {roommate.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="flex-shrink-0 mr-2 h-4 w-4" />
                  Joined {new Date(roommate.joinedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add new roommate card */}
        {isAddingRoommate && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200 border-2 border-primary-200"
          >
            <div className="px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  Invite New Roommate
                </h3>
                <button
                  onClick={handleCancelAdd}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="name"
                      className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                        errors.name 
                          ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder="John Doe"
                      value={newRoommateName}
                      onChange={(e) => setNewRoommateName(e.target.value)}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      className={`block w-full pl-10 pr-3 py-2 rounded-md ${
                        errors.email 
                          ? 'border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500' 
                          : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      }`}
                      placeholder="john@example.com"
                      value={newRoommateEmail}
                      onChange={(e) => setNewRoommateEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email}</p>
                  )}
                </div>
                <div className="pt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddRoommate}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Send Invitation
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {roommates.length === 0 && !isAddingRoommate && (
        <div className="text-center py-12 bg-white shadow rounded-lg mt-6">
          <div className="flex flex-col items-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No roommates yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by inviting your roommates to split expenses
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddingRoommate(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Invite Roommate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roommates;