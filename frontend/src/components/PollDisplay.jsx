import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import api from '../services/api';
import { showErrorToast, showSuccessToast } from '../utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function PollDisplay({ poll, onVote, isOrganizer }) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = new Date(poll.endTime).getTime();
      return Math.max(0, endTime - now);
    };

    setTimeLeftMs(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 50); // Update every 100ms

    return () => clearInterval(timer);
  }, [poll]);

  useEffect(() => {
    const checkIfVoted = async () => {
      try {
        const response = await api.get(`/polls/${poll._id}/user-vote`);
        if (response.data.hasVoted) {
          setHasVoted(true);
          setSelectedOption(response.data.optionIndex);
        }
      } catch (error) {
        console.error('Error checking user vote:', error);
      }
    };

    checkIfVoted();
  }, [poll._id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleVote = async () => {
    if (hasVoted || selectedOption === null) return;
    try {
      const response = await api.post(`/polls/${poll._id}/vote`, { optionIndex: selectedOption });
      console.log(response.data);
      setHasVoted(true);
      showSuccessToast(t('pollDisplay.successVoting'));
    } catch (error) {
      console.error('Error voting on poll:', error);
      showErrorToast(t('pollDisplay.errorVoting'));
    }
  };

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const pollDurationMs = new Date(poll.endTime).getTime() - new Date(poll.createdAt).getTime();

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getWinningOption = () => {
    return poll.options.reduce((max, option) => option.votes > max.votes ? option : max);
  };

  const handleEndPoll = async () => {
    try {
      await api.put(`/polls/${poll._id}/end`);
      setIsDropdownOpen(false);
      showSuccessToast('Poll ended successfully');
    } catch (error) {
      console.error('Error ending poll:', error);
      showErrorToast('Failed to end poll');
    }
  };

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const isPollEnded = !poll.isActive;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card text-card-foreground w-full overflow-hidden relative mb-4 rounded-lg shadow-lg"
    >
      <div 
        className={`px-4 py-2 cursor-pointer transition-colors duration-200`}
        onClick={toggleExpand}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground font-medium">
            {isPollEnded ? t('pollDisplay.ended') : t('pollDisplay.currentPoll')}
          </span>
          <div className="flex items-center space-x-2">
            {isOrganizer && !isPollEnded && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-muted-foreground hover:text-foreground focus:outline-none p-1"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                {isDropdownOpen && (
                  <div 
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg z-10"
                  >
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-secondary"
                      onClick={handleEndPoll}
                    >
                      End Poll
                    </button>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={toggleExpand}
              className="text-muted-foreground hover:text-foreground focus:outline-none p-1"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <h3 className="text-base font-semibold break-words">{poll.question}</h3>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 pb-4">
              <div className="space-y-2 mb-4">
                {poll.options.map((option, index) => {
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  const isWinning = isPollEnded && option.votes === getWinningOption().votes;
                  const isSelected = selectedOption === index;
                  return (
                    <div 
                      key={index} 
                      className={`relative bg-secondary h-10 rounded-full overflow-hidden cursor-pointer ${isSelected ? 'ring-2 ring-accent' : ''}`}
                      onClick={() => !hasVoted && !isPollEnded && setSelectedOption(index)}
                    >
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#9147ff] to-[#0891b2] transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative flex items-center h-full px-3 z-10">
                        <span className="flex-grow truncate mr-2 text-foreground">{option.text}</span>
                        <span className="flex-shrink-0 w-12 text-right text-muted-foreground">{Math.round(percentage)}%</span>
                        {isWinning && (
                          <div className="ml-2 text-yellow-500">
                            🏆
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t('pollDisplay.totalVotes', { count: totalVotes })}</span>
                <div className="flex items-center">
                  {!isPollEnded && (
                    <button
                      className={`bg-gradient-to-r from-[#9147ff] to-[#0891b2] px-4 py-2 rounded-full text-sm font-semibold ${
                        hasVoted || selectedOption === null ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#a970ff] hover:to-[#0aa2c0]'
                      }`}
                      onClick={handleVote}
                      disabled={hasVoted || selectedOption === null}
                    >
                      {hasVoted ? t('pollDisplay.voted') : t('pollDisplay.vote')}
                    </button>
                  )}
                  <div className="ml-2 bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                    {isPollEnded ? t('pollDisplay.ended') : formatTime(timeLeftMs)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isExpanded && !isPollEnded && (
        <div className="h-1 bg-secondary overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#9147ff] to-[#0891b2] transition-all duration-100 ease-linear rounded-full" 
            style={{ 
              width: `${(timeLeftMs / pollDurationMs) * 100}%`,
              marginRight: '-2px', // Compensate for the rounded edge on the right
            }} 
          />
        </div>
      )}
    </motion.div>
  );
}
