export default {
  localResource: {
    comp:     'http://csp-api.sam.gov/comp/iam',
    minc:     'https://csp-api.sam.gov/minc/iam',
    prodlike: 'https://csp-api.sam.gov/prodlike/iam'
  },

  remoteResource: {
    comp:     'http://csp-api.sam.gov/comp/iam',
    minc:     'https://csp-api.sam.gov/minc/iam',
    prodlike: 'https://csp-api.sam.gov/prodlike/iam'
  },

  cookies: {
    path: '/'
  },

  session:   'https://csp-api.sam.gov/{environment}/IdentityandAccess/v3/auth/session/?api_key=rkkGBk7AU8UQs9LHT6rM0rFkg3A3rGaiBntKSGEC',
  mergeWith: '/users/v3/mergeWith/{email}',

  registration: {
    init:     '/registration/api/{email}/registerEmailValidation',
    confirm:  '/registration/api/emailValidation',
    register: '/registration/api/register'
  },

  password: {
    authenticated: '/password/api/{email}/changePassword',
    unauthenticated: {
      init:   '/password/api/{email}/passwordReset/',
      verify: '/password/api/passwordResetVerifyEmail',
      kba:    '/password/api/kbaAnswer',
      reset:  '/password/api/passwordReset'
    }
  },

  details: {
    update:     '/my-details/api/update',
    deactivate: '/my-details/api/deactivate'
  },

  kba: {
    questions: 'https://csp-api.sam.gov/{environment}/IdentityandAccess/v1/kba/getAnswerIds?api_key=rkkGBk7AU8UQs9LHT6rM0rFkg3A3rGaiBntKSGEC',
    update:    'https://csp-api.sam.gov/{environment}/IdentityandAccess/v1/kba/updateAnswers?api_key=rkkGBk7AU8UQs9LHT6rM0rFkg3A3rGaiBntKSGEC'
  },

  import: {
    roles: '/import/{email}/roles'
  }
};
