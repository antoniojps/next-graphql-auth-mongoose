import sgMail from '@sendgrid/mail';
import { errSchema, resSchema } from '../../utils/schemas';
import getConfig from 'next/config';

const { EMAIL_API_KEY, EMAIL_SENDER } = getConfig().serverRuntimeConfig;

const sendEmail = async ({ to, username, url }) => {
  sgMail.setApiKey(EMAIL_API_KEY);
  // message to client
  const msgVerifyEmail = {
    to,
    from: EMAIL_SENDER,
    templateId: 'd-615f75613bb74ce597b4a1fa1836c592',
    dynamic_template_data: {
      username,
      to,
      url,
    },
  };
  try {
    await sgMail.send(msgVerifyEmail);
  } catch (err) {
    throw new Error(err.message || 'error sending email');
  }
};

export default async (req, res) => {
  switch (req.method) {
    case 'POST': {
      const {
        body: { to, username, url },
      } = req;

      if (!username || !to || !url) {
        res.status(400).json(errSchema('Invalid parameters', 401));
      }

      try {
        await sendEmail({ to, username, url });
        res.status(200).json(
          resSchema(
            {
              to,
              username,
              url,
            },
            200
          )
        );
      } catch (err) {
        res
          .status(500)
          .json(errSchema(err.message || 'error sending email', 500));
      }
      break;
    }
    default:
      res.status(405).end(); //Method Not Allowed
      break;
  }
};
