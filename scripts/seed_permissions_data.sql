-- Seed data for Permissions System
-- Run this after create_permissions_schema.sql migration

-- Insert all 11 roles
INSERT INTO roles (id, name, subtitle, icon, description) VALUES
    ('plaintiff', 'Plaintiff', 'Case Initiator', '⚖️', 'Initiates cases and submits claims'),
    ('defendant', 'Defendant', 'Case Responder', '🛡️', 'Responds to cases and provides defense'),
    ('witness', 'Witness', 'Testimony Provider', '👁️', 'Provides testimony and evidence'),
    ('jury_member', 'Jury Member', 'Decision Maker', '👥', 'Votes on case outcomes'),
    ('attorney', 'Attorney', 'Legal Rep', '📜', 'Legal representation and case management'),
    ('expert_witness', 'Expert Witness', 'Specialist', '🔬', 'Specialized testimony and analysis'),
    ('investigator', 'Investigator', 'Evidence Collector', '🔍', 'Evidence collection and verification'),
    ('law_enforcement', 'Law Enforcement', 'Official', '🚔', 'Official capacity participation'),
    ('moderator', 'Moderator', 'Community Manager', '🛠️', 'Content moderation and community management'),
    ('admin', 'Admin', 'Administrator', '👑', 'Administrative access to all non-system features'),
    ('super_admin', 'Super Admin', 'Full Access', '⭐', 'Full system access including all features')
ON CONFLICT (id) DO NOTHING;

-- Insert all 19 permissions
INSERT INTO permissions (id, name, description, category) VALUES
    -- Case Management
    ('manage_cases', 'Manage Cases', 'Create, edit, and delete cases', 'case_management'),
    ('respond_to_case', 'Respond to Case', 'Respond to case sections and provide counter-arguments', 'case_management'),
    
    -- Content
    ('submit_evidence', 'Submit Evidence', 'Submit evidence to cases', 'content'),
    ('submit_testimony', 'Submit Testimony', 'Submit testimony to cases', 'content'),
    ('comment', 'Comment', 'Post comments and participate in discussions', 'content'),
    ('flag_content', 'Flag Content', 'Flag inappropriate or rule-violating content for review', 'content'),
    
    -- Moderation
    ('verify_evidence', 'Verify Evidence', 'Verify and approve submitted evidence', 'moderation'),
    ('moderate_content', 'Moderate Content', 'Review flagged content and make moderation decisions', 'moderation'),
    ('delete_posts', 'Delete Posts', 'Delete user posts, comments, and inappropriate content', 'moderation'),
    ('ban_users', 'Ban Users', 'Temporarily or permanently ban users from the platform', 'moderation'),
    
    -- Voting
    ('vote', 'Vote', 'Cast votes on cases and case-related decisions', 'voting'),
    
    -- Administration
    ('manage_users', 'Manage Users', 'View, edit, and manage user accounts and profiles', 'administration'),
    ('manage_roles', 'Manage Roles', 'Create, edit, and assign user roles', 'administration'),
    ('manage_permissions', 'Manage Permissions', 'Configure role permissions and access control', 'administration'),
    ('access_admin_dashboard', 'Access Admin Dashboard', 'Access administrative dashboard and tools', 'administration'),
    
    -- Forms
    ('access_plaintiff_form', 'Access Plaintiff Case Form', 'Access and submit new cases as plaintiff', 'forms'),
    ('access_witness_form', 'Access Witness Form', 'Access witness submission form', 'forms'),
    ('access_expert_witness_form', 'Access Expert Witness Form', 'Access expert witness submission form', 'forms'),
    ('access_investigator_form', 'Access Investigator Form', 'Access investigator submission form', 'forms')
ON CONFLICT (id) DO NOTHING;

-- Assign default permissions to each role
-- Super Admin gets everything
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 'super_admin', id, true FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin gets everything
INSERT INTO role_permissions (role_id, permission_id, granted)
SELECT 'admin', id, true FROM permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Moderator permissions (moderation + content + basic participation)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('moderator', 'verify_evidence', true),
    ('moderator', 'moderate_content', true),
    ('moderator', 'delete_posts', true),
    ('moderator', 'ban_users', true),
    ('moderator', 'comment', true),
    ('moderator', 'flag_content', true),
    ('moderator', 'vote', true),
    ('moderator', 'submit_evidence', true),
    ('moderator', 'submit_testimony', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Law Enforcement (verification + evidence + testimony)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('law_enforcement', 'verify_evidence', true),
    ('law_enforcement', 'submit_evidence', true),
    ('law_enforcement', 'submit_testimony', true),
    ('law_enforcement', 'comment', true),
    ('law_enforcement', 'flag_content', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Investigator (evidence collection + forms)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('investigator', 'submit_evidence', true),
    ('investigator', 'submit_testimony', true),
    ('investigator', 'comment', true),
    ('investigator', 'access_investigator_form', true),
    ('investigator', 'flag_content', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Expert Witness (testimony + evidence + forms)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('expert_witness', 'submit_evidence', true),
    ('expert_witness', 'submit_testimony', true),
    ('expert_witness', 'comment', true),
    ('expert_witness', 'access_expert_witness_form', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Attorney (case management + evidence + forms)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('attorney', 'manage_cases', true),
    ('attorney', 'respond_to_case', true),
    ('attorney', 'submit_evidence', true),
    ('attorney', 'submit_testimony', true),
    ('attorney', 'comment', true),
    ('attorney', 'access_plaintiff_form', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Jury Member (voting only + basic participation)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('jury_member', 'vote', true),
    ('jury_member', 'comment', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Witness (testimony + forms)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('witness', 'submit_testimony', true),
    ('witness', 'comment', true),
    ('witness', 'access_witness_form', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Defendant (response + evidence + forms)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('defendant', 'respond_to_case', true),
    ('defendant', 'submit_evidence', true),
    ('defendant', 'submit_testimony', true),
    ('defendant', 'comment', true),
    ('defendant', 'flag_content', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Plaintiff (case creation + evidence + forms)
INSERT INTO role_permissions (role_id, permission_id, granted) VALUES
    ('plaintiff', 'manage_cases', true),
    ('plaintiff', 'submit_evidence', true),
    ('plaintiff', 'submit_testimony', true),
    ('plaintiff', 'comment', true),
    ('plaintiff', 'access_plaintiff_form', true)
ON CONFLICT (role_id, permission_id) DO NOTHING;
