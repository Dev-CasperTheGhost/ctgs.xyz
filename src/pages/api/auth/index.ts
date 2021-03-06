import * as yup from "yup";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "lib/prisma";
import { getSession } from "lib/auth/server";
import { validateSchema } from "@casper124578/utils";
import { parseBody } from "lib/utils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req);
  const method = req.method as keyof typeof handlers;

  if (!session) {
    return res.status(401).send("Unauthorized");
  }

  const handlers = {
    GET: async () => {
      const urls = await prisma.url.findMany({
        where: {
          userId: session.id,
        },
      });

      return res.json({ user: session, urls });
    },
    PUT: async () => {
      const body = parseBody(req);
      const schema = {
        name: yup.string().required().min(2).max(255),
        isPublic: yup.boolean(),
      };

      if (session.login !== session!.login) {
        return res.status(401).send("Unauthorized");
      }

      const [error] = await validateSchema(schema, body);

      if (error) {
        return res.status(400).send(error.message);
      }

      const updated = await prisma.user.update({
        where: {
          id: session.id,
        },
        data: {
          name: body.name,
          isPublic: body.isPublic,
        },
      });

      return res.json({ session: updated });
    },
    DELETE: async () => {
      await prisma.user.delete({
        where: {
          id: session.id,
        },
      });

      return res.status(200).send("OK");
    },
  };

  const handler = handlers[method];
  if (handler) {
    return handler();
  }

  return res.status(405).send("Method not allowed");
}
