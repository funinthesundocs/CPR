'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { User } from '@supabase/supabase-js'

type Comment = {
    id: string
    author_id: string
    parent_id: string | null
    body: string
    upvote_count: number
    downvote_count: number
    is_flagged: boolean
    created_at: string
    user_profiles?: { display_name: string; avatar_url: string | null }
    replies?: Comment[]
}

type Props = {
    commentableType: string
    commentableId: string
}

export function CommentsSection({ commentableType, commentableId }: Props) {
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [replyTo, setReplyTo] = useState<string | null>(null)
    const [replyText, setReplyText] = useState('')
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)

    const loadComments = useCallback(async () => {
        const { data } = await supabase
            .from('comments')
            .select('*, user_profiles(display_name, avatar_url)')
            .eq('commentable_type', commentableType)
            .eq('commentable_id', commentableId)
            .eq('is_hidden', false)
            .order('created_at', { ascending: false })
            .limit(100)

        if (data) {
            // Build threaded structure
            const topLevel = data.filter(c => !c.parent_id)
            const replies = data.filter(c => c.parent_id)

            const threaded = topLevel.map(parent => ({
                ...parent,
                replies: replies.filter(r => r.parent_id === parent.id),
            }))

            setComments(threaded)
        }
        setLoading(false)
    }, [supabase, commentableType, commentableId])

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            await loadComments()
        }
        init()

        // Realtime subscription for new comments
        const channel = supabase
            .channel(`comments:${commentableType}:${commentableId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `commentable_id=eq.${commentableId}`,
                },
                () => { loadComments() }
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [supabase, commentableType, commentableId, loadComments])

    const postComment = async (body: string, parentId: string | null = null) => {
        if (!user || !body.trim()) return
        setPosting(true)

        const { error } = await supabase.from('comments').insert({
            commentable_type: commentableType,
            commentable_id: commentableId,
            author_id: user.id,
            parent_id: parentId,
            body: body.trim(),
        })

        if (!error) {
            setNewComment('')
            setReplyTo(null)
            setReplyText('')
            await loadComments()
        }

        setPosting(false)
    }

    const voteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
        if (!user) return

        // Check for existing vote
        const { data: existing } = await supabase
            .from('comment_votes')
            .select('id, vote_type')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .maybeSingle()

        if (existing) {
            if (existing.vote_type === voteType) {
                // Remove vote
                await supabase.from('comment_votes').delete().eq('id', existing.id)
            } else {
                // Change vote
                await supabase.from('comment_votes').update({ vote_type: voteType }).eq('id', existing.id)
            }
        } else {
            await supabase.from('comment_votes').insert({
                comment_id: commentId,
                user_id: user.id,
                vote_type: voteType,
            })
        }

        await loadComments()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Discussion ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
                </h3>
            </div>

            {/* New Comment */}
            {user ? (
                <div className="space-y-3">
                    <Textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Share your thoughts on this case..."
                        rows={3}
                        maxLength={2000}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{newComment.length}/2000</p>
                        <Button
                            size="sm"
                            onClick={() => postComment(newComment)}
                            disabled={posting || !newComment.trim()}
                        >
                            {posting ? 'Posting...' : 'Post Comment'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        <a href="/login" className="text-primary hover:underline">Sign in</a> to join the discussion
                    </p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
            ) : comments.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                    <p className="text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="space-y-3">
                            <CommentCard
                                comment={comment}
                                user={user}
                                onReply={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                onVote={voteComment}
                            />

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-8 space-y-3 border-l-2 border-border pl-4">
                                    {comment.replies.map(reply => (
                                        <CommentCard
                                            key={reply.id}
                                            comment={reply}
                                            user={user}
                                            onVote={voteComment}
                                            isReply
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Reply Input */}
                            {replyTo === comment.id && user && (
                                <div className="ml-8 space-y-2">
                                    <Textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Write a reply..."
                                        rows={2}
                                        maxLength={2000}
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => { setReplyTo(null); setReplyText('') }}>
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => postComment(replyText, comment.id)}
                                            disabled={posting || !replyText.trim()}
                                        >
                                            Reply
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function CommentCard({
    comment,
    user,
    onReply,
    onVote,
    isReply = false,
}: {
    comment: Comment
    user: User | null
    onReply?: () => void
    onVote: (id: string, type: 'upvote' | 'downvote') => void
    isReply?: boolean
}) {
    const profile = comment.user_profiles as any
    const score = (comment.upvote_count || 0) - (comment.downvote_count || 0)

    return (
        <div className="rounded-lg border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                    <span className="text-sm font-medium">{profile?.display_name || 'Anonymous'}</span>
                    <span className="text-xs text-muted-foreground">
                        {timeAgo(comment.created_at)}
                    </span>
                </div>
                {comment.is_flagged && <Badge variant="outline" className="text-xs text-amber-500">Flagged</Badge>}
            </div>

            <p className="text-sm whitespace-pre-wrap">{comment.body}</p>

            <div className="flex items-center gap-3">
                {user && (
                    <>
                        <button
                            onClick={() => onVote(comment.id, 'upvote')}
                            className="text-xs text-muted-foreground hover:text-green-500 transition-colors"
                        >
                            👍 {comment.upvote_count || 0}
                        </button>
                        <button
                            onClick={() => onVote(comment.id, 'downvote')}
                            className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                        >
                            👎 {comment.downvote_count || 0}
                        </button>
                    </>
                )}
                {!user && (
                    <span className="text-xs text-muted-foreground">
                        Score: {score >= 0 ? '+' : ''}{score}
                    </span>
                )}
                {onReply && user && !isReply && (
                    <button
                        onClick={onReply}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                        💬 Reply
                    </button>
                )}
            </div>
        </div>
    )
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(dateStr).toLocaleDateString()
}
