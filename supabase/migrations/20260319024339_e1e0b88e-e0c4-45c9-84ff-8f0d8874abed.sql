DROP POLICY "Admins manage own empresa roles" ON public.user_roles;

CREATE POLICY "Admins manage own empresa roles"
ON public.user_roles
FOR ALL
TO public
USING (
  has_role(auth.uid(), 'admin'::app_role)
  AND empresa_id = get_user_empresa_id(auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  AND empresa_id = get_user_empresa_id(auth.uid())
  AND role != 'super_admin'::app_role
);