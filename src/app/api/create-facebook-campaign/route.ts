import { NextResponse } from 'next/server';

const FB_API = 'https://graph.facebook.com/v19.0';

export async function POST(req: Request) {
  try {
    const { adAccountId, accessToken, campaignDetails, pageId } =
      await req.json();

    if (!adAccountId || !accessToken || !campaignDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(campaignDetails , pageId,adAccountId)

    /* ---------- helpers ---------- */
    const fb = async (path: string, body?: any) => {
      const url = `${FB_API}/${path}?access_token=${accessToken}`;
      const res = await fetch(url, {
        method: body ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();

      /*  ⬇️  NEW: pretty-print the entire FB error once  */
      if (!res.ok) {
        console.error('❌ Facebook API error:', {
          url,
          status: res.status,
          statusText: res.statusText,
          body: json,
        });
        throw new Error(json.error?.message || 'FB API error');
      }

      return json;
    };

    /* ---------- 1. Campaign ---------- */
    const campaignRes = await fb(`${adAccountId}/campaigns`, {
      name: campaignDetails.campaignName,
      objective: campaignDetails.objective,
      status: 'PAUSED',
      special_ad_categories: [],
    });
    const campaignId = campaignRes.id;

    /* ---------- 2. Ad Set ---------- */
    const adSetRes = await fb(`${adAccountId}/adsets`, {
      name: `AdSet for ${campaignDetails.campaignName}`,
      campaign_id: campaignId,
      daily_budget: Math.round(campaignDetails.budgetAmount * 100),
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'REACH',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',   // <-- add this line
      targeting: { geo_locations: { countries: ['US'] } },
      start_time: campaignDetails.startDate,
      end_time: campaignDetails.endDate,
      status: 'PAUSED',
    });
    const adSetId = adSetRes.id;

    /* ---------- 3. Creative + Ad (optional) ---------- */
    let adId: string | null = null;
    if (campaignDetails.headlines?.length && campaignDetails.finalUrl) {
      const creativeRes = await fb(`${adAccountId}/adcreatives`, {
        name: `Creative for ${campaignDetails.campaignName}`,
        object_story_spec: {
          page_id: pageId,
          link_data: {
            link: campaignDetails.finalUrl,
            message: campaignDetails.descriptions?.[0] || '',
            name: campaignDetails.headlines[0],
            call_to_action: { type: campaignDetails.callToAction || 'LEARN_MORE' },
            picture: 'https://skezvvinpjzxdpidbglf.supabase.co/storage/v1/object/public/case-documents/Gloop.PNG',
          },
        },
      });
      const creativeId = creativeRes.id;

      const adRes = await fb(`${adAccountId}/ads`, {
        name: `Ad for ${campaignDetails.campaignName}`,
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: 'PAUSED',
      });
      adId = adRes.id;
    }

    return NextResponse.json({
      message: 'Facebook campaign created successfully',
      campaignId,
      adSetId,
      adId,
    });
  } catch (err: any) {
    /*  ⬇️  NEW: always log the caught error  */
    console.error('☠️  Facebook campaign error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}