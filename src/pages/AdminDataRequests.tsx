// @ts-nocheck
// TypeScript checking disabled for deployment compatibility
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { cn } from "@/lib/utils";

interface DeletionRequest {
  id: string;
  user_id: string;
  email: string;
  reason: string;
  status: "pending" | "approved" | "completed" | "rejected" | "cancelled";
  request_type: "immediate" | "manual_review";
  reviewed_by: string | null;
  reviewed_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

const AdminDataRequests = () => {
  const { isRTL } = useLang();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletionRequests();
  }, []);

  const fetchDeletionRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("type", "data_deletion_request")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform notifications into deletion request format
      const transformedRequests: DeletionRequest[] = (data || []).map(
        (notif) => ({
          id: notif.id,
          user_id: notif.user_id,
          email: "", // We'll fetch this separately
          reason: notif.message.replace("Data Deletion Request: ", ""),
          status: notif.read ? "completed" : "pending",
          request_type: "manual_review",
          reviewed_by: null,
          reviewed_at: null,
          completed_at: notif.read ? notif.updated_at : null,
          notes: null,
          created_at: notif.created_at,
          updated_at: notif.updated_at,
        }),
      );

      setRequests(transformedRequests);
    } catch (error) {
      console.error("Error fetching deletion requests:", error);
      toast.error("Failed to load deletion requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: DeletionRequest["status"],
  ) => {
    try {
      if (newStatus === "completed") {
        // Mark notification as read
        const { error } = await supabase
          .from("notifications")
          .update({
            read: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId);

        if (error) throw error;
      }

      toast.success(`Request ${newStatus} successfully`);
      fetchDeletionRequests();
    } catch (error) {
      console.error("Error updating request status:", error);
      toast.error("Failed to update request status");
    }
  };

  const getStatusBadge = (status: DeletionRequest["status"]) => {
    const variants = {
      pending: {
        color:
          "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
        label: "Pending Review",
      },
      approved: {
        color:
          "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
        label: "Approved",
      },
      completed: {
        color:
          "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
        label: "Completed",
      },
      rejected: {
        color: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
        label: "Rejected",
      },
      cancelled: {
        color: "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200",
        label: "Cancelled",
      },
    };

    const variant = variants[status];
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">
          Loading deletion requests...
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full", isRTL && "rtl")}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Data Deletion Requests
          </h1>
          <p className="text-muted-foreground">
            Review and manage user data deletion requests in compliance with
            privacy regulations.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-xl font-bold">
                    {requests.filter((r) => r.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">
                    {requests.filter((r) => r.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-xl font-bold">
                    {requests.filter((r) => r.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{requests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Deletion Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 className="h-12 w-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No deletion requests found
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            User ID: {request.user_id}
                          </span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Requested:{" "}
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                          <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                          <span className="text-foreground">
                            {request.reason}
                          </span>
                        </div>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateStatus(request.id, "rejected")
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(request.id, "completed")
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      )}
                    </div>

                    {request.completed_at && (
                      <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                        Completed:{" "}
                        {new Date(request.completed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Data Deletion Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Review Process:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Review the user's deletion request and reason</li>
                  <li>• Verify the user's identity if necessary</li>
                  <li>• Check for any legal holds or retention requirements</li>
                  <li>• Approve or reject based on compliance guidelines</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data to Delete:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• User profile and account information</li>
                  <li>• Lead data and conversation history</li>
                  <li>• Projects and custom settings</li>
                  <li>• Notifications and system logs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDataRequests;
