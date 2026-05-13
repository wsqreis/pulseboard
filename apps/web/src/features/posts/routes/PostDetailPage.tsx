import { useParams } from 'react-router-dom'

import { useAuthSession } from '../../auth/useAuthSession'
import { CreateCommentForm } from '../components/CreateCommentForm'
import { UpdatePostForm } from '../components/UpdatePostForm'
import { useCommentsQuery, usePostQuery } from '../hooks'

export function PostDetailPage() {
  const { postId = '' } = useParams()
  const { accessToken } = useAuthSession()
  const postQuery = usePostQuery(postId)
  const commentsQuery = useCommentsQuery(postId)

  if (postQuery.isLoading || commentsQuery.isLoading) {
    return <section className="panel full-width-panel">Loading post…</section>
  }

  if (postQuery.data === undefined || commentsQuery.data === undefined) {
    return <section className="panel full-width-panel">Unable to load this post.</section>
  }

  const post = postQuery.data
  const comments = commentsQuery.data

  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">{post.status}</span>
        <h1 className="section-title">{post.title}</h1>
        <p className="section-copy">{post.body_markdown}</p>
        <div className="inline-links top-offset-sm">
          {post.is_pinned ? <span className="inline-note">Pinned</span> : null}
          {post.is_locked ? <span className="inline-note">Locked</span> : null}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Update your post</h2>
        <UpdatePostForm
          accessToken={accessToken}
          initialBody={post.body_markdown}
          initialTitle={post.title}
          postId={post.id}
        />
      </section>

      <section className="panel">
        <h2 className="section-title">Comments</h2>
        <div className="stack-md top-offset-sm">
          {comments.length === 0 ? (
            <p className="section-copy">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <article className="comment-card" key={comment.id}>
                <div className="card-row">
                  <strong className="card-title">Comment</strong>
                  <span className="inline-note">{comment.status}</span>
                </div>
                <p className="section-copy">{comment.body_markdown}</p>
              </article>
            ))
          )}
        </div>
        {!post.is_locked ? (
          <div className="top-offset-sm">
            <CreateCommentForm accessToken={accessToken} postId={post.id} />
          </div>
        ) : (
          <p className="inline-note top-offset-sm">Comments are disabled while this post is locked.</p>
        )}
      </section>
    </>
  )
}
