// frontend/src/components/Admin/CustomRoleManagement.jsx

import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SketchPicker } from 'react-color';
import api from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import { useTranslation } from 'react-i18next';

export function CustomRoleManagement() {
  const { t } = useTranslation();
  const [organizers, setOrganizers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [roleColor, setRoleColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const response = await api.get('/roles/organizers');
      setOrganizers(response.data);
    } catch (error) {
      showErrorToast(t('customRole.errorFetchingOrganizers'));
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !roleName) {
      showErrorToast(t('customRole.selectUserAndRole'));
      return;
    }

    try {
      await api.post('/roles/assign-custom-role', {
        userId: selectedUser._id,
        roleName,
        roleColor
      });
      showSuccessToast(t('customRole.roleAssigned'));
      fetchOrganizers();
      setSelectedUser(null);
      setRoleName('');
      setRoleColor('#ffffff');
    } catch (error) {
      showErrorToast(t('customRole.errorAssigningRole'));
    }
  };

  const handleRemoveRole = async () => {
    if (!selectedUser) {
      showErrorToast(t('customRole.selectUser'));
      return;
    }

    try {
      await api.post('/roles/remove-custom-role', {
        userId: selectedUser._id
      });
      showSuccessToast(t('customRole.roleRemoved'));
      fetchOrganizers();
      setSelectedUser(null);
      setRoleName('');
      setRoleColor('#ffffff');
    } catch (error) {
      showErrorToast(t('customRole.errorRemovingRole'));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('customRole.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('customRole.organizerList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {organizers.map(organizer => (
                <li 
                  key={organizer._id} 
                  className={`p-2 rounded cursor-pointer ${selectedUser?._id === organizer._id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'}`}
                  onClick={() => setSelectedUser(organizer)}
                >
                  {organizer.username}
                  {organizer.customRole && (
                    <span 
                      className="ml-2 px-2 py-1 text-xs rounded" 
                      style={{ backgroundColor: organizer.customRole.color, color: '#000' }}
                    >
                      {organizer.customRole.name}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('customRole.assignRole')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="roleName">{t('customRole.roleName')}</Label>
                <Input 
                  id="roleName" 
                  value={roleName} 
                  onChange={(e) => setRoleName(e.target.value)} 
                  placeholder={t('customRole.roleNamePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="roleColor">{t('customRole.roleColor')}</Label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded border cursor-pointer" 
                    style={{ backgroundColor: roleColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <Input 
                    id="roleColor" 
                    value={roleColor} 
                    onChange={(e) => setRoleColor(e.target.value)} 
                    placeholder="#ffffff"
                  />
                </div>
                {showColorPicker && (
                  <div className="absolute z-10 mt-2">
                    <SketchPicker 
                      color={roleColor}
                      onChange={(color) => setRoleColor(color.hex)}
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAssignRole} disabled={!selectedUser || !roleName}>
                  {t('customRole.assignButton')}
                </Button>
                <Button onClick={handleRemoveRole} disabled={!selectedUser || !selectedUser.customRole} variant="destructive">
                  {t('customRole.removeButton')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
