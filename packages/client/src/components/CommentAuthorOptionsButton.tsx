import styled from '@emotion/styled'
import React from 'react'
import {MenuPosition} from '~/hooks/useCoords'
import useMenu from '~/hooks/useMenu'
import {PALETTE} from '~/styles/paletteV2'
import lazyPreload from '~/utils/lazyPreload'
import Icon from './Icon'
import PlainButton from './PlainButton/PlainButton'

const CommentAuthorOptionsDropdown = lazyPreload(() =>
  import(/* webpackChunkName: 'CommentAuthorOptionsDropdown' */ './CommentAuthorOptionsDropdown')
)

const StyledIcon = styled(Icon)({
  borderRadius: 24,
  color: PALETTE.TEXT_GRAY,
  display: 'block',
  flexShrink: 0,
  fontSize: 18,
  height: 24,
  lineHeight: '24px',
  marginLeft: 'auto',
  textAlign: 'center',
  width: 24
})

interface Props {
  commentId: string
  editComment: () => void
}

const CommentAuthorOptionsButton = (props: Props) => {
  const {commentId, editComment} = props
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <PlainButton
      onMouseEnter={CommentAuthorOptionsDropdown.preload}
      ref={originRef}
      onClick={togglePortal}
    >
      <StyledIcon>more_vert</StyledIcon>
      {menuPortal(
        <CommentAuthorOptionsDropdown
          menuProps={menuProps}
          commentId={commentId}
          editComment={editComment}
        />
      )}
    </PlainButton>
  )
}

export default CommentAuthorOptionsButton
