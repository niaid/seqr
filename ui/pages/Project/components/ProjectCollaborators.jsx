import React from 'react'
import PropTypes from 'prop-types'
import orderBy from 'lodash/orderBy'
import { Icon, Popup } from 'semantic-ui-react'
import { connect } from 'react-redux'

import DataLoader from 'shared/components/DataLoader'
import { HorizontalSpacer } from 'shared/components/Spacers'
import DeleteButton from 'shared/components/buttons/DeleteButton'
import UpdateButton from 'shared/components/buttons/UpdateButton'
import { RadioGroup, AddableSelect } from 'shared/components/form/Inputs'
import { validators } from 'shared/components/form/ReduxFormWrapper'

import { updateCollaborator, loadUserOptions } from '../reducers'
import { getProject, getUsersByUsername, getUserOptions, getUserOptionsIsLoading } from '../selectors'


const CollaboratorEmailDropdown = ({ load, loading, usersByUsername, onChange, value, ...props }) =>
  <DataLoader load={load} loading={false} content>
    <AddableSelect
      loading={loading}
      additionLabel="New Collaborator: "
      onChange={val => onChange(usersByUsername[val] || { email: val })}
      value={value.username || value.email}
      {...props}
    />
  </DataLoader>

CollaboratorEmailDropdown.propTypes = {
  load: PropTypes.func,
  loading: PropTypes.bool,
  usersByUsername: PropTypes.object,
  onChange: PropTypes.func,
  value: PropTypes.any,
}

const mapDropdownStateToProps = state => ({
  loading: getUserOptionsIsLoading(state),
  options: getUserOptions(state),
  usersByUsername: getUsersByUsername(state),
})

const mapDropdownDispatchToProps = {
  load: loadUserOptions,
}

const NAME_FIELDS = [
  {
    name: 'firstName',
    label: 'First Name',
    width: 8,
    inline: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    width: 8,
    inline: true,
  },
]

const CREATE_FIELDS = [
  {
    name: 'user',
    label: 'Email',
    component: connect(mapDropdownStateToProps, mapDropdownDispatchToProps)(CollaboratorEmailDropdown),
    validate: validators.required,
    width: 16,
    inline: true,
  },
  ...NAME_FIELDS.map(({ name, ...field }) => ({ ...field, name: `user.${name}` })),
]

const EDIT_FIELDS = [
  {
    name: 'hasEditPermissions',
    label: 'Access Level',
    component: RadioGroup,
    options: [{ value: false, text: 'Collaborator' }, { value: true, text: 'Manager' }],
  },
  ...NAME_FIELDS,
]


const AddCollaboratorButton = ({ project, onSubmit }) => (
  project.canEdit ?
    <UpdateButton
      modalId="addCollaborator"
      modalTitle="Add Collaborator"
      onSubmit={onSubmit}
      formFields={CREATE_FIELDS}
      editIconName="plus"
      buttonText="Add Collaborator"
      showErrorPanel
    /> : null
)

AddCollaboratorButton.propTypes = {
  project: PropTypes.object,
  onSubmit: PropTypes.func,
}

const mapStateToProps = state => ({
  project: getProject(state),
})

const mapCreateDispatchToProps = {
  onSubmit: updates => updateCollaborator(updates.user),
}

export const AddProjectCollaboratorButton = connect(mapStateToProps, mapCreateDispatchToProps)(AddCollaboratorButton)

const ProjectCollaborators = ({ project, onSubmit }) => (
  orderBy(project.collaborators, [c => c.hasEditPermissions, c => c.email], ['desc', 'asc']).map((c, i) =>
    <div key={c.username}>
      <Popup
        position="top center"
        trigger={<Icon link name={c.hasEditPermissions ? 'star' : ''} />}
        content={c.hasEditPermissions ? 'Has "Manager" permissions' : ''}
        size="small"
      />
      {c.displayName && <span>{c.displayName}<br /><HorizontalSpacer width={20} /></span>}
      <i><a href={`mailto:${c.email}`}>{c.email}</a></i>
      {project.canEdit &&
        <span>
          <HorizontalSpacer width={10} />
          <UpdateButton
            modalId={`editCollaborator-${c.email}`}
            modalTitle={`Edit Collaborator: ${c.displayName || c.email}`}
            onSubmit={onSubmit}
            formFields={EDIT_FIELDS}
            initialValues={c}
            showErrorPanel
          />
          <DeleteButton
            initialValues={c}
            onSubmit={onSubmit}
            confirmDialog={
              <div className="content">
                Are you sure you want to delete <b>{c.displayName || c.email}</b>. They will still have their user account
                 and be able to log in, but will not be able to access this project anymore.
              </div>
            }
          />
        </span>

      }
    </div>,
  )
)


ProjectCollaborators.propTypes = {
  project: PropTypes.object.isRequired,
}

const mapDispatchToProps = {
  onSubmit: updateCollaborator,
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectCollaborators)
