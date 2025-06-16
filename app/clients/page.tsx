import { prisma } from '@/lib/prisma';
import { DashboardWrapper } from '@/components/dashboard-wrapper';
import { ClientsPage } from '@/components/clients-page';
import { validateRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';

async function ClientsPageWrapper() {
  const { user } = await validateRequest();
  if (!user) {
    return redirect("/");
  }

  const clients = await prisma.client.findMany({
    where: {
      userId: user.id,
    },
  });

  return (
    <DashboardWrapper>
      <ClientsPage initialClients={clients} userId={user.id} />
    </DashboardWrapper>
  );
}

export default ClientsPageWrapper;
