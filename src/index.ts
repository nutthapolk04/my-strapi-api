// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      const admin = await strapi.db.query('admin::user').findOne({
        where: { email: 'admin@test.com' },
      });

      if (admin) {
        const password = await strapi.admin.services.auth.hashPassword('Password123!');
        await strapi.db.query('admin::user').update({
          where: { id: admin.id },
          data: { password },
        });
        strapi.log.info('Admin password reset successfully');
      }
    } catch (error) {
      strapi.log.error('Failed to reset admin password', error);
    }
  },
};
