import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { getAreaQr } from "@/pages/Area/api";
import type { TaskTemplate } from "../types";

function QrImage({ value, title }: { value: string; title: string }) {
  return (
    <QRCodeSVG
      value={value}
      title={`QR code for ${title}`}
      size={180}
      level="M"
      marginSize={4}
      bgColor="#f8fafc"
      fgColor="#1a1a1a"
      className="h-auto max-w-full"
    />
  );
}

function RoomQr({ areaId, title }: { areaId: number; title: string }) {
  const qr = useQuery({
    queryKey: ["area-qr", areaId],
    queryFn: () => getAreaQr(areaId),
    retry: false,
  });

  if (qr.isPending) {
    return <p role="status" className="py-6 text-sm text-muted-foreground">Loading room QR…</p>;
  }

  if (qr.isError || !qr.data?.payload?.trim() || qr.isRefetchError) {
    return (
      <div className="space-y-2 py-2">
        <p role="alert" className="text-sm text-muted-foreground">Room QR could not be loaded.</p>
        <Button size="sm" variant="outline" disabled={qr.isFetching} onClick={() => void qr.refetch()}>
          {qr.isFetching ? "Loading…" : "Retry QR"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <QrImage value={qr.data.payload} title={title} />
      <p className="text-center text-xs text-muted-foreground">Scan this room QR in the guided verification flow.</p>
    </div>
  );
}

export default function TaskTemplateQr({ template }: { template: TaskTemplate }) {
  return (
    <section aria-label={`QR for ${template.title}`} className="mt-3 border-t border-gray-100 pt-3">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Room QR code</p>
      {template.verificationVersion === 2 && template.areaId ? (
        <RoomQr key={template.areaId} areaId={template.areaId} title={template.title} />
      ) : (
        <p role="status" className="text-sm text-muted-foreground">Map this schedule to an area inventory to show its room QR.</p>
      )}
    </section>
  );
}
