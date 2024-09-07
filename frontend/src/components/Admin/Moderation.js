import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CheckIcon, XIcon } from 'lucide-react';
import api from '../../services/api';
import Layout from '../HUDlayout';

function Moderation() {
  const [pendingMessages, setPendingMessages] = useState([]);

  useEffect(() => {
    fetchPendingMessages();
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
      fetchPendingMessages();
    } catch (error) {
      console.error('Error approving message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}`);
      fetchPendingMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-6">Message Moderation</h1>
        {pendingMessages.length === 0 ? (
          <p className="text-muted-foreground">No pending messages</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingMessages.map(message => (
              <Card key={message._id} className="overflow-hidden">
                <CardContent className="p-6">
                  <p className="font-semibold mb-2">{message.event.name}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    By: {message.user ? message.user.username : message.name}
                  </p>
                  <p className="text-sm mb-4">{message.content}</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Created at: {new Date(message.createdAt).toLocaleString()}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(message._id)}
                    >
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(message._id)}
                    >
                      <XIcon className="h-4 w-4 mr-2" />
                      Delete
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