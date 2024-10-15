import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckIcon, XIcon } from 'lucide-react';
import api from '../../services/api';
import Layout from '../HUDlayout';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import socket from '../../services/socket';
import { useTranslation } from 'react-i18next';

function Moderation() {
  const { t } = useTranslation();
  const [pendingMessages, setPendingMessages] = useState([]);

  useEffect(() => {
    fetchPendingMessages();

    // Socket event listeners
    socket.on('new message to moderate', (newMessage) => {
      setPendingMessages(prevMessages => [...prevMessages, newMessage]);
    });

    socket.on('message approved', (messageId) => {
      setPendingMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
    });

    socket.on('message deleted', (messageId) => {
      setPendingMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
    });

    return () => {
      socket.off('new message to moderate');
      socket.off('message approved');
      socket.off('message deleted');
    };
  }, []);

  const fetchPendingMessages = async () => {
    try {
      const response = await api.get('/messages/pending');
      setPendingMessages(response.data);
    } catch (error) {
      console.error('Error fetching pending messages:', error);
    }
  };

  const handleApprove = async (messageId) => {
    try {
      await api.put(`/messages/approve/${messageId}`);
      setPendingMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
      showSuccessToast('Message approved successfully');
    } catch (error) {
      console.error('Error approving message:', error);
      showErrorToast('Failed to approve message');
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      setPendingMessages(prevMessages => prevMessages.filter(msg => msg._id !== messageId));
      showSuccessToast('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      showErrorToast('Failed to delete message');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-6">{t('moderation.title')}</h1>
        {pendingMessages.length === 0 ? (
          <p className="text-muted-foreground">{t('moderation.noPendingMessages')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingMessages.map(message => (
              <Card key={message._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <p className="font-semibold mb-2">{message.event.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {t('moderation.by', { user: message.user ? message.user.username : message.name })}
                  </p>
                  <p className="text-sm mb-4">{message.content}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {t('moderation.createdAt', { date: new Date(message.createdAt).toLocaleString() })}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(message._id)}
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      {t('moderation.approve')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(message._id)}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      {t('moderation.delete')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Moderation;