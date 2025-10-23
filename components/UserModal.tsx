
import React from 'react';
import { UserProfile, AgeGroup, HealthCondition, ActivityLevel } from '../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, userProfile, setUserProfile }) => {
  if (!isOpen) return null;

  const handleHealthConditionChange = (condition: HealthCondition) => {
    const currentConditions = userProfile.healthConditions;
    let newConditions;
    if (currentConditions.includes(condition)) {
      newConditions = currentConditions.filter(c => c !== condition);
      if (newConditions.length === 0) {
        newConditions.push(HealthCondition.None);
      }
    } else {
      newConditions = [...currentConditions.filter(c => c !== HealthCondition.None), condition];
    }
    setUserProfile({ ...userProfile, healthConditions: newConditions });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-white">Your Health Profile</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
            <select
              value={userProfile.ageGroup}
              onChange={(e) => setUserProfile({ ...userProfile, ageGroup: e.target.value as AgeGroup })}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(AgeGroup).map(group => <option key={group} value={group}>{group}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pre-existing Health Conditions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(HealthCondition).map(condition => (
                <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userProfile.healthConditions.includes(condition)}
                    onChange={() => handleHealthConditionChange(condition)}
                    className="h-4 w-4 rounded bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-600"
                  />
                  <span className="text-gray-300">{condition}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Typical Activity Level</label>
             <select
              value={userProfile.activityLevel}
              onChange={(e) => setUserProfile({ ...userProfile, activityLevel: e.target.value as ActivityLevel })}
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(ActivityLevel).map(level => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
