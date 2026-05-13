import { Link, useParams } from 'react-router-dom'

import { useAuthSession } from '../../auth/useAuthSession'
import {
  useBoardsQuery,
  useCommunityQuery,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from '../hooks'
import { CreateBoardForm } from '../components/CreateBoardForm'

export function CommunityDetailPage() {
  const { slug = '' } = useParams()
  const { accessToken, currentUser } = useAuthSession()
  const communityQuery = useCommunityQuery(slug)
  const boardsQuery = useBoardsQuery(slug)
  const joinMutation = useJoinCommunityMutation(accessToken, slug)
  const leaveMutation = useLeaveCommunityMutation(accessToken, slug)

  if (communityQuery.isLoading || boardsQuery.isLoading) {
    return <section className="panel full-width-panel">Loading community…</section>
  }

  if (communityQuery.data === undefined || boardsQuery.data === undefined) {
    return <section className="panel full-width-panel">Unable to load this community.</section>
  }

  const community = communityQuery.data
  const boards = boardsQuery.data

  return (
    <>
      <section className="panel hero-panel">
        <span className="status-pill">{community.visibility}</span>
        <h1 className="section-title">{community.name}</h1>
        <p className="section-copy">{community.description}</p>
        <div className="inline-links top-offset-sm">
          <button
            className="primary-button auth-submit"
            disabled={currentUser === null || joinMutation.isPending}
            onClick={() => joinMutation.mutate()}
            type="button"
          >
            {joinMutation.isPending ? 'Joining…' : 'Join community'}
          </button>
          <button
            className="secondary-button auth-submit"
            disabled={currentUser === null || leaveMutation.isPending}
            onClick={() => leaveMutation.mutate()}
            type="button"
          >
            {leaveMutation.isPending ? 'Leaving…' : 'Leave community'}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Boards</h2>
        <div className="stack-md top-offset-sm">
          {boards.length === 0 ? (
            <p className="section-copy">No boards yet.</p>
          ) : (
            boards.map((board) => (
              <Link className="board-card" key={board.id} to={`/communities/${slug}/boards/${board.slug}`}>
                <div>
                  <h3 className="card-title">{board.name}</h3>
                  <p className="section-copy">{board.description}</p>
                </div>
                <span className="inline-note">Open board</span>
              </Link>
            ))
          )}
        </div>
      </section>

      <CreateBoardForm accessToken={accessToken} slug={slug} />
    </>
  )
}
