import r from '../../database/rethinkDriver';
import {errorObj} from './utils';

export const getUserId = authToken => {
  return authToken && typeof authToken === 'object' && authToken.sub;
};

export const isSuperUser = authToken => {
  const userId = getUserId(authToken);
  return userId && authToken.rol === 'su';
};

export const getTeamMember = (authToken, teamId) => {
  const userId = getUserId(authToken);
  if (userId) {
    const teamMembers = r.table('TeamMember')
      .getAll(teamId, {index: 'teamId'})
      .filter({cachedUserId: userId})
      .pluck('teamId');
    return teamMembers[0];
  }
};

export const requireAuth = authToken => {
  const userId = getUserId(authToken);
  if (userId) return userId;
  throw errorObj({_error: 'Unauthorized. Must be logged in for this action.'});
};

/*
 * Won't return a teamMember if it's a super user
 */
export const requireSUOrTeamMember = (authToken, teamId) => {
  if (isSuperUser(authToken)) return;
  const teamMember = getTeamMember(authToken, teamId);
  if (teamMember) return teamMember;
  throw errorObj({_error: 'Unauthorized. Must be a member of the team.'});
};

export const requireSU = authToken => {
  if (!isSuperUser(authToken)) {
    throw errorObj({_error: 'Unauthorized. Must be a super user to run this query.'});
  }
};
