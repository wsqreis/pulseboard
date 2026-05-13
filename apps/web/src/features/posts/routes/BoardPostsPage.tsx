import { Link, useParams } from 'react-router-dom'

import { useAuthSession } from '../../auth/useAuthSession'
import { CreatePostForm } from '../components/CreatePostForm'
import { useBoardPostsQuery } from '../hooks'

export function BoardPostsPage() {
  const { boardSlug = '', slug = '' } = useParams()
  const { accessToken } = useAuthSession()
  const postsQuery = useBoardPostsQuery(slug, boardSlug)

  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">Board feed</span>
        <h1 className="section-title">{boardSlug.replaceAll('-', ' ')}</h1>
        <p className="section-copy">Explore the current discussion threads in this board.</p>
      </section>

      <section className="panel">
        <h2 className="section-title">Posts</h2>
        <div className="stack-md top-offset-sm">
          {postsQuery.isLoading ? <p className="section-copy">Loading posts…</p> : null}
          {postsQuery.data?.map((post) => (
            <Link className="community-card" key={post.id} to={`/posts/${post.id}`}>
              <div>
                <div className="card-row">
                  <h3 className="card-title">{post.title}</h3>
                  <span className="inline-note">{post.status}</span>
                </div>
                <p className="section-copy">{post.body_markdown}</p>
              </div>
              <div className="stack-sm align-end-text">
                {post.is_pinned ? <span className="inline-note">Pinned</span> : null}
                {post.is_locked ? <span className="inline-note">Locked</span> : null}
                <span className="text-link">View post</span>
              </div>
            </Link>
          ))}
          {postsQuery.data?.length === 0 ? (
            <p className="section-copy">No posts yet. Publish the first thread below.</p>
          ) : null}
        </div>
      </section>

      <CreatePostForm accessToken={accessToken} boardSlug={boardSlug} communitySlug={slug} />
    </>
  )
}
