import { createStitches, createTheme } from '@stitches/core';
import { I18nVariables, merge, VIEWS, en } from '@supabase/auth-ui-shared';
import React, { useEffect, useState } from 'react';
import { Auth as AuthProps } from '../../types';
import {
  EmailAuth,
  EmailAuthProps,
  ForgottenPassword,
  MagicLink,
  SocialAuth,
  UpdatePassword,
  VerifyOtp,
} from './interfaces';
import { UserContextProvider, useUser } from './UserContext';

function Auth({
  supabaseClient,
  socialLayout = 'vertical',
  providers,
  providerScopes,
  queryParams,
  view = 'sign_in',
  redirectTo,
  onlyThirdPartyProviders = false,
  magicLink = false,
  showLinks = true,
  appearance,
  theme = 'default',
  localization = { variables: {} },
  otpType = 'email',
  additionalData,
  passwordLimit,
  children,
}: AuthProps): JSX.Element | null {
  /**
   * Localization support
   */

  const i18n: I18nVariables = merge(en, localization.variables ?? {});

  const [authView, setAuthView] = useState(view);
  const [defaultEmail, setDefaultEmail] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');

  /**
   * Simple boolean to detect if authView 'sign_in' or 'sign_up' or 'magic_link' is used
   *
   * @returns boolean
   */
  const SignView = authView === 'sign_in' || authView === 'sign_up' || authView === 'magic_link';

  useEffect(() => {
    createStitches({
      theme: merge(appearance?.theme?.default ?? {}, appearance?.variables?.default ?? {}),
    });
  }, [appearance]);

  /**
   * Wraps around all auth components
   * renders the social auth providers if SignView is true
   *
   * also handles the theme override
   *
   * @param children
   * @returns React.ReactNode
   */
  // eslint-disable-next-line react/no-unstable-nested-components
  const Container = ({ children }: { children: React.ReactNode }) => (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <div
      className={
        theme !== 'default'
          ? createTheme(
              merge(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                appearance?.theme[theme],
                appearance?.variables?.[theme] ?? {},
              ),
            )
          : ''
      }
    >
      {SignView && (
        <SocialAuth
          appearance={appearance}
          supabaseClient={supabaseClient}
          providers={providers}
          providerScopes={providerScopes}
          queryParams={queryParams}
          socialLayout={socialLayout}
          redirectTo={redirectTo}
          onlyThirdPartyProviders={onlyThirdPartyProviders}
          i18n={i18n}
          view={authView}
        />
      )}
      {!onlyThirdPartyProviders && children}
    </div>
  );

  useEffect(() => {
    /**
     * Overrides the authview if it is changed externally
     */
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password');
      } else if (event === 'USER_UPDATED') {
        setAuthView('sign_in');
      }
    });
    setAuthView(view);

    return () => authListener.subscription.unsubscribe();
  }, [supabaseClient.auth, view]);

  const emailProp: Omit<EmailAuthProps, 'authView' | 'id'> = {
    appearance,
    defaultEmail,
    defaultPassword,
    i18n,
    magicLink,
    passwordLimit,
    redirectTo,
    setAuthView,
    setDefaultEmail,
    setDefaultPassword,
    showLinks,
    supabaseClient,
  };

  /**
   * View handler, displays the correct Auth view
   * all views are wrapped in <Container/>
   */
  switch (authView) {
    case VIEWS.SIGN_IN:
      return (
        <Container>
          <EmailAuth {...emailProp} authView="sign_in" />
        </Container>
      );
    case VIEWS.SIGN_UP:
      return (
        <Container>
          <EmailAuth
            appearance={appearance}
            supabaseClient={supabaseClient}
            authView="sign_up"
            setAuthView={setAuthView}
            defaultEmail={defaultEmail}
            defaultPassword={defaultPassword}
            setDefaultEmail={setDefaultEmail}
            setDefaultPassword={setDefaultPassword}
            redirectTo={redirectTo}
            magicLink={magicLink}
            showLinks={showLinks}
            i18n={i18n}
            additionalData={additionalData}
            passwordLimit={passwordLimit}
            // eslint-disable-next-line react/no-children-prop
            children={children}
          />
        </Container>
      );
    case VIEWS.FORGOTTEN_PASSWORD:
      return (
        <Container>
          <ForgottenPassword
            appearance={appearance}
            supabaseClient={supabaseClient}
            setAuthView={setAuthView}
            redirectTo={redirectTo}
            showLinks={showLinks}
            i18n={i18n}
          />
        </Container>
      );

    case VIEWS.MAGIC_LINK:
      return (
        <Container>
          <MagicLink
            appearance={appearance}
            supabaseClient={supabaseClient}
            setAuthView={setAuthView}
            redirectTo={redirectTo}
            showLinks={showLinks}
            i18n={i18n}
          />
        </Container>
      );

    case VIEWS.UPDATE_PASSWORD:
      return (
        <UpdatePassword
          appearance={appearance}
          supabaseClient={supabaseClient}
          i18n={i18n}
          passwordLimit={passwordLimit}
        />
      );
    case VIEWS.VERIFY_OTP:
      return <VerifyOtp appearance={appearance} supabaseClient={supabaseClient} otpType={otpType} i18n={i18n} />;
    default:
      return null;
  }
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Auth.ForgottenPassword = ForgottenPassword;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Auth.UpdatePassword = UpdatePassword;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Auth.MagicLink = MagicLink;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Auth.UserContextProvider = UserContextProvider;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
Auth.useUser = useUser;

export default Auth;
