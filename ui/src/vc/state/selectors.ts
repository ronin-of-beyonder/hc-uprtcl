import { Branch, Context, Commit, CommitObject } from '../types';
import { createSelector } from 'reselect';
import { VersionControlState } from './reducer';
import { EntityState } from '../utils/entity';
import { RootState } from '../../store';

export const selectVersionControl = (state: RootState) => state.versionControl;

export const selectContexts = (state: VersionControlState) =>
  state.contexts.ids.map(id => state.contexts.entities[id]);

export const selectContextById = (contextId: string) => (
  state: VersionControlState
) => state.contexts.entities[contextId];

export const selectContextBranches = (contextId: string) => (
  state: VersionControlState
) =>
  state.branches.ids
    .map(id => state.branches.entities[id])
    .filter(branch => branch.context_address === contextId);

export const selectBranchById = (branchId: string) => (
  state: VersionControlState
) => state.branches.entities[branchId];

export const selectCommitById = (commitId: string) => (
  state: VersionControlState
) => state.commits.entities[commitId];

export const selectBranchHead = (branchId: string) => (
  state: VersionControlState
) => state.commits.entities[selectBranchById(branchId)(state).branch_head];

export const selectObjects = (state: VersionControlState) => state.objects;

export const selectObjectFromBranch = (branchId: string) =>
  createSelector(
    selectBranchHead(branchId),
    selectObjects,
    (commit: Commit, objects: EntityState<CommitObject>) =>
      commit ? objects.entities[commit.object_address] : null
  );

export const selectObjectFromContext = (contextId: string) =>
  createSelector(
    selectContextBranches(contextId),
    s => s,
    (branches: Branch[], state: VersionControlState) =>
      branches.length > 0 ? selectObjectFromBranch(branches[0].id)(state) : null
  );

export const selectCurrentObjects = createSelector(
  [selectContexts, s => s],
  (contexts: Context[], state: VersionControlState) =>
    contexts
      .map(context => selectObjectFromContext(context.id)(state))
      .filter(o => o != null)
);