import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "./ui/button";
import Layout from './HUDlayout';
import { useTranslation } from 'react-i18next';
import { CustomRoleManagement } from './Admin/CustomRoleManagement';

export function AdminActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 md:px-6">
        <h1 className="text-2xl font-bold mb-6">{t('adminActions.title')}</h1>
        <div className="space-y-6">
          <Button onClick={() => navigate('/moderate')} className="w-full">
            {t('adminActions.moderate')}
          </Button>
          <div className="bg-card rounded-lg p-6">
            
            <CustomRoleManagement />
          </div>
        </div>
      </div>
    </Layout>
  );
}