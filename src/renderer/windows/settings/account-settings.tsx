import { capitalize } from 'lodash';
import React, { FunctionComponent, useCallback } from 'react';
import styled from 'styled-components';

import { Row } from '../../components';
import { useCurrentlyPlaying } from '../../contexts/currently-playing.context';
import { useHover } from '../../hooks/use-hover';
import { CurrentlyPlayingActions } from '../../reducers/currently-playing.reducer';

const Image = styled.img`
  max-width: 48px;
  max-height: 48px;
  border-radius: 50%;
  margin-right: 0.5rem;
`;

const InfoRow = styled(Row)`
  align-items: center;
  padding: 0.5rem 0;
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const LogoutButton = styled.button`
  display: flex;
  text-align: left;
  align-content: flex-end;
  width: fit-content;
  margin-top: 0.25rem;
`;

const UserInformation = styled.div`
  display: flex;
  width: 100%;
`;

const UserName = styled.div`
  display: flex;
  width: 100%;
`;

const NoAvatar = styled.li`
  font-size: 300%;
  margin: 0 1rem 0;
`;

interface Props {
  onLogout: () => void;
}

export const AccountSettings: FunctionComponent<Props> = ({ onLogout }) => {
  const {
    state: { userProfile },
    dispatch,
  } = useCurrentlyPlaying();

  const {
    isHovering,
    props: { onMouseEnter, onMouseLeave },
  } = useHover();

  const handleLogoutClick = useCallback(() => {
    onLogout();
    dispatch({
      type: CurrentlyPlayingActions.SetUserProfile,
      payload: null,
    });
  }, [dispatch, onLogout]);

  return (
    <InfoRow>
      {userProfile && (
        <>
          {userProfile.avatar ? (
            <Image src={userProfile.avatar} alt="Spotify account logo" height={48} width={48} />
          ) : (
            <NoAvatar className="fa-solid fa-user-ninja" />
          )}
          <InfoWrapper>
            <UserInformation>
              <UserName>
                {userProfile.name} ({userProfile.email})
              </UserName>
              <LogoutButton
                type="button"
                className="unstyled-button"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={handleLogoutClick}>
                {isHovering ? <i className="fa-solid fa-link-slash" /> : <i className="fa-solid fa-link" />}
              </LogoutButton>
            </UserInformation>
            <div>{capitalize(userProfile.product)} account</div>
          </InfoWrapper>
        </>
      )}
    </InfoRow>
  );
};
