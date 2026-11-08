import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  Trash2, 
  Save, 
  X, 
  MoreVertical, 
  Calendar, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  Play,
  Pause,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface QueuedLead {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  company?: string;
  queue_status: 'queued' | 'processing' | 'completed' | 'failed' | 'paused';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_date?: string;
  created_at: string;
  updated_at: string;
  attempts: number;
  heat_score: number;
  estimated_process_time?: number;
  last_contacted?: string;
  queue_position: number;
}

interface QueueEditableDataTableProps {
  data: QueuedLead[];
  onUpdateLead: (leadId: string, updates: Partial<QueuedLead>) => Promise<void>;
  onRemoveLead: (leadId: string) => Promise<void>;
  onBulkAction: (action: 'remove' | 'pause' | 'resume' | 'priority', leadIds: string[], value?: any) => Promise<void>;
  onReorderQueue: (leadIds: string[], newPositions: number[]) => Promise<void>;
  loading?: boolean;
}

interface EditingCell {
  leadId: string;
  field: string;
  value: any;
}

export function QueueEditableDataTable({ 
  data, 
  onUpdateLead, 
  onRemoveLead, 
  onBulkAction, 
  onReorderQueue, 
  loading = false 
}: QueueEditableDataTableProps) {
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter and search data
  const filteredData = useMemo(() => {
    return data.filter(lead => {
      const matchesSearch = searchTerm === '' || 
        lead.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || lead.queue_status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [data, searchTerm, statusFilter, priorityFilter]);

  const handleCellEdit = (leadId: string, field: string, currentValue: any) => {
    setEditingCell({ leadId, field, value: currentValue });
  };

  const handleCellSave = async () => {
    if (!editingCell) return;

    try {
      await onUpdateLead(editingCell.leadId, {
        [editingCell.field]: editingCell.value
      });
      setEditingCell(null);
      toast.success('Lead updated successfully');
    } catch (error) {
      toast.error('Failed to update lead');
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(filteredData.map(lead => lead.id)));
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleMoveUp = async (leadId: string) => {
    const lead = data.find(l => l.id === leadId);
    if (!lead || lead.queue_position <= 1) return;

    const newPosition = lead.queue_position - 1;
    await onUpdateLead(leadId, { queue_position: newPosition });
  };

  const handleMoveDown = async (leadId: string) => {
    const lead = data.find(l => l.id === leadId);
    const maxPosition = Math.max(...data.map(l => l.queue_position));
    if (!lead || lead.queue_position >= maxPosition) return;

    const newPosition = lead.queue_position + 1;
    await onUpdateLead(leadId, { queue_position: newPosition });
  };

  const handleBulkRemove = async () => {
    if (selectedLeads.size === 0) return;
    
    try {
      await onBulkAction('remove', Array.from(selectedLeads));
      setSelectedLeads(new Set());
      toast.success(`${selectedLeads.size} leads removed from queue`);
    } catch (error) {
      toast.error('Failed to remove leads from queue');
    }
  };

  const handleBulkPriority = async (priority: string) => {
    if (selectedLeads.size === 0) return;
    
    try {
      await onBulkAction('priority', Array.from(selectedLeads), priority);
      setSelectedLeads(new Set());
      toast.success(`Priority updated for ${selectedLeads.size} leads`);
    } catch (error) {
      toast.error('Failed to update priority');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'queued': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEditableCell = (lead: QueuedLead, field: string, value: any) => {
    const isEditing = editingCell?.leadId === lead.id && editingCell?.field === field;

    if (isEditing) {
      if (field === 'priority') {
        return (
          <div className="flex items-center gap-2">
            <Select 
              value={editingCell.value} 
              onValueChange={(value) => setEditingCell({...editingCell, value})}
            >
              <SelectTrigger className="w-24" aria-label="Priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave} aria-label="Save">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCellCancel} aria-label="Cancel">
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else if (field === 'queue_status') {
        return (
          <div className="flex items-center gap-2">
            <Select 
              value={editingCell.value} 
              onValueChange={(value) => setEditingCell({...editingCell, value})}
            >
              <SelectTrigger className="w-32" aria-label="Queue status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleCellSave} aria-label="Save">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCellCancel} aria-label="Cancel">
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else if (field === 'scheduled_date') {
        return (
          <div className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={editingCell.value}
              onChange={(e) => setEditingCell({...editingCell, value: e.target.value})}
              className="w-48"
            />
            <Button size="sm" onClick={handleCellSave} aria-label="Save">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCellCancel} aria-label="Cancel">
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      } else {
        return (
          <div className="flex items-center gap-2">
            <Input
              value={editingCell.value}
              onChange={(e) => setEditingCell({...editingCell, value: e.target.value})}
              className="w-32"
            />
            <Button size="sm" onClick={handleCellSave} aria-label="Save">
              <Save className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCellCancel} aria-label="Cancel">
              <X className="h-3 w-3" />
            </Button>
          </div>
        );
      }
    }

    // Display mode
    if (field === 'priority') {
      return (
        <Badge 
          className={`${getPriorityColor(value)} cursor-pointer`}
          onClick={() => handleCellEdit(lead.id, field, value)}
        >
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </Badge>
      );
    } else if (field === 'queue_status') {
      return (
        <Badge 
          className={`${getStatusColor(value)} cursor-pointer whitespace-nowrap`}
          onClick={() => handleCellEdit(lead.id, field, value)}
        >
          {String(value).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}
        </Badge>
      );
    } else if (field === 'scheduled_date') {
      return (
        <div 
          className="cursor-pointer hover:bg-gray-50 p-1 rounded"
          onClick={() => handleCellEdit(lead.id, field, value)}
        >
          {value ? format(new Date(value), 'MMM dd, yyyy HH:mm') : 'Not scheduled'}
        </div>
      );
    } else {
      return (
        <div 
          className="cursor-pointer hover:bg-gray-50 p-1 rounded"
          onClick={() => handleCellEdit(lead.id, field, value)}
        >
          {value || '-'}
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute start-3 top-5 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search leads..."
              aria-label="Search leads"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full ps-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32" aria-label="Filter by priority">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedLeads.size > 0 && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleBulkRemove}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove ({selectedLeads.size})
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Set Priority ({selectedLeads.size})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkPriority('urgent')}>
                  Urgent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriority('high')}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriority('medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkPriority('low')}>
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all queued leads"
                  checked={selectedLeads.size === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Lead</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Heat Score</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((lead) => (
              <TableRow key={lead.id}>
                                 <TableCell>
                   <Checkbox
                     aria-label={`Select ${lead.full_name}`}
                     checked={selectedLeads.has(lead.id)}
                     onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                   />
                 </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="font-mono text-sm">{lead.queue_position}</span>
                    <div className="flex flex-col">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveUp(lead.id)}
                        aria-label="Move up in queue"
                        disabled={lead.queue_position <= 1}
                        className="h-4 w-4 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMoveDown(lead.id)}
                        aria-label="Move down in queue"
                        disabled={lead.queue_position >= Math.max(...data.map(l => l.queue_position))}
                        className="h-4 w-4 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{lead.full_name}</div>
                    <div className="text-sm text-gray-500">{lead.company}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{lead.email}</div>
                    <div className="text-gray-500">{lead.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {renderEditableCell(lead, 'queue_status', lead.queue_status)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(lead, 'priority', lead.priority)}
                </TableCell>
                <TableCell>
                  {renderEditableCell(lead, 'scheduled_date', lead.scheduled_date)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {lead.heat_score}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{lead.attempts}</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" aria-label={`Actions for ${lead.full_name}`}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleCellEdit(lead.id, 'priority', lead.priority)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCellEdit(lead.id, 'scheduled_date', lead.scheduled_date)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onRemoveLead(lead.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Queue
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No leads in queue</p>
          <p className="text-sm">Add leads to the queue to get started</p>
        </div>
      )}
    </div>
  );
} 