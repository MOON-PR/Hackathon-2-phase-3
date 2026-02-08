import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '@/services/taskService'
import { Task, TaskCreate, TaskUpdate } from '@/types/task'
import { toast } from 'react-hot-toast'

// Query hook for fetching tasks
export function useTasksQuery(
    searchTerm?: string,
    categoryFilter?: string,
    priorityFilter?: string,
    tagsFilter?: string[],
    sortBy?: string,
    order?: 'asc' | 'desc'
) {
    return useQuery({
        queryKey: ['tasks', searchTerm, categoryFilter, priorityFilter, tagsFilter, sortBy, order],
        queryFn: () => taskService.getAllTasksWithFilters(
            searchTerm,
            categoryFilter,
            priorityFilter,
            tagsFilter,
            sortBy,
            order
        ),
        staleTime: 1000 * 10, // 10 seconds
    })
}

// OPTIMISTIC: Create task mutation with instant UI update
export function useCreateTaskMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (taskData: TaskCreate) => taskService.createTask(taskData),
        onMutate: async (newTask) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tasks'] })

            // Snapshot previous value
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            // Optimistically update with temp task
            const tempTask: Task = {
                id: `temp-${Date.now()}`,
                description: newTask.description,
                category: newTask.category || 'General',
                priority: newTask.priority || 'Medium',
                tags: newTask.tags || [],
                completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            queryClient.setQueryData<Task[]>(['tasks'], (old) => {
                return old ? [...old, tempTask] : [tempTask]
            })

            return { previousTasks, tempTask }
        },
        onError: (err, newTask, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks)
            }
            toast.error('Failed to create task. Please try again.')
        },
        onSuccess: () => {
            toast.success('Task created!')
        },
        onSettled: () => {
            // Always refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

// OPTIMISTIC: Update task mutation with instant UI update
export function useUpdateTaskMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TaskUpdate }) =>
            taskService.updateTask(id, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            // Optimistically update
            queryClient.setQueryData<Task[]>(['tasks'], (old) => {
                return old?.map(task =>
                    task.id === id ? { ...task, ...data, updated_at: new Date().toISOString() } : task
                ) || []
            })

            return { previousTasks }
        },
        onError: (err, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks)
            }
            toast.error('Failed to update task. Please try again.')
        },
        onSuccess: () => {
            toast.success('Task updated!')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

// OPTIMISTIC: Toggle task completion with instant UI update
export function useToggleTaskMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
            taskService.completeTask(id, completed),
        onMutate: async ({ id, completed }) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            // Optimistically toggle completion
            queryClient.setQueryData<Task[]>(['tasks'], (old) => {
                return old?.map(task =>
                    task.id === id ? { ...task, completed, updated_at: new Date().toISOString() } : task
                ) || []
            })

            return { previousTasks }
        },
        onError: (err, variables, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks)
            }
            toast.error('Failed to update task. Please try again.')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

// OPTIMISTIC: Delete task mutation with instant UI update
export function useDeleteTaskMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => taskService.deleteTask(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['tasks'] })
            const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

            // Optimistically remove task
            queryClient.setQueryData<Task[]>(['tasks'], (old) => {
                return old?.filter(task => task.id !== id) || []
            })

            return { previousTasks }
        },
        onError: (err, id, context) => {
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks'], context.previousTasks)
            }
            toast.error('Failed to delete task. Please try again.')
        },
        onSuccess: () => {
            toast.success('Task deleted!')
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
    })
}

// Hook to manually invalidate tasks (for chatbot integration)
export function useInvalidateTasks() {
    const queryClient = useQueryClient()

    return () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
}
