import { useState } from 'react';
import { Plus, Pencil, Trash2, Phone, User as UserIcon, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { UserSidebarLayout } from '@/components/layouts/SidebarLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { cn } from '@/lib/utils';
import type { EmergencyContact } from '@/lib/types';

export function Contacts() {
  const { session } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', priority: '1' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts', session?.user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', session!.user!.id)
        .order('priority', { ascending: true });
      return data as EmergencyContact[];
    },
    enabled: !!session?.user?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        relationship: form.relationship.trim(),
        phone: form.phone.trim(),
        priority: parseInt(form.priority) || 1,
      };
      if (editing) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(payload)
          .eq('id', editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({ ...payload, user_id: session!.user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast('success', editing ? 'Contact updated' : 'Contact added', form.name);
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', relationship: '', phone: '', priority: '1' });
    },
    onError: (err: Error) => toast('error', 'Save failed', err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteId) return;
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', deleteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast('success', 'Contact deleted');
      setDeleteId(null);
    },
    onError: (err: Error) => toast('error', 'Delete failed', err.message),
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (form.phone.trim().length < 7) e.phone = 'Enter a valid phone number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    saveMutation.mutate();
  };

  const openEdit = (c: EmergencyContact) => {
    setEditing(c);
    setForm({ name: c.name, relationship: c.relationship, phone: c.phone, priority: String(c.priority) });
    setShowForm(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ name: '', relationship: '', phone: '', priority: '1' });
    setErrors({});
    setShowForm(true);
  };

  return (
    <UserSidebarLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <PageHeader
          title="Emergency Contacts"
          subtitle="People who will be notified during an emergency"
          actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Contact</Button>}
        />

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : contacts && contacts.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <Card key={c.id} className="hover:border-info-500/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-500/10 flex-shrink-0">
                    <UserIcon className="h-5 w-5 text-info-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white truncate">{c.name}</h3>
                      {c.priority === 1 && (
                        <Badge color="bg-warning-500/20 text-warning-400 border-warning-500/40">Primary</Badge>
                      )}
                    </div>
                    <p className="text-xs text-navy-300 mt-0.5">{c.relationship || 'Contact'}</p>
                    <p className="text-sm text-navy-200 font-mono mt-1">{c.phone}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded p-1.5 text-navy-400 hover:text-info-400 hover:bg-navy-800 transition-colors"
                      aria-label="Edit contact"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="rounded p-1.5 text-navy-400 hover:text-emergency-400 hover:bg-navy-800 transition-colors"
                      aria-label="Delete contact"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={Users}
              title="No emergency contacts yet"
              description="Add trusted people who will be notified when an emergency is triggered."
              action={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Contact</Button>}
            />
          </Card>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Contact' : 'Add Emergency Contact'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Jane Doe"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Relationship"
            placeholder="Sister, Friend, Spouse..."
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          />
          <Input
            label="Phone"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={errors.phone}
          />
          <div>
            <label className="block text-sm font-medium text-navy-200 mb-1.5">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full rounded-lg border border-navy-700 bg-navy-800/50 px-4 py-2.5 text-sm text-white focus:border-info-500 focus:outline-none"
            >
              <option value="1">1 — Primary</option>
              <option value="2">2 — Secondary</option>
              <option value="3">3 — Tertiary</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button size="md" onClick={handleSubmit} loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Add Contact'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Contact?"
        message="This contact will be permanently removed from your emergency contacts."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </UserSidebarLayout>
  );
}
