// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

function createTerrainTile(id, sourceSha256) {
  const itemId = id.replace(/_2_2056_5728\.tif$/, '');
  return {
    id,
    url: `https://data.geo.admin.ch/ch.swisstopo.swissalti3d/${itemId}/${id}`,
    sourceSha256
  };
}

export const TERRAIN_SOURCES = {
  'albula-landwasser': {
    sourceBoundsLV95: [2769700, 1171600, 2771400, 1172550],
    tiles: [
      createTerrainTile(
        'swissalti3d_2023_2769-1171_2_2056_5728.tif',
        '52e4fe2d2c563de149e2217ffe9ae74448852907b76ff887b20d67f446ea2266'
      ),
      createTerrainTile(
        'swissalti3d_2023_2769-1172_2_2056_5728.tif',
        '81cfa176336cc2a3b21429c1cae82df49f982dded19ba92b2281e9eeb8a371c8'
      ),
      createTerrainTile(
        'swissalti3d_2023_2770-1171_2_2056_5728.tif',
        'c2c66e8452270e133fd29b212e9e92b7ca00f1920bafa354450d3713be15778c'
      ),
      createTerrainTile(
        'swissalti3d_2023_2770-1172_2_2056_5728.tif',
        'd624e55091945d873f2a4b5db4b523af96b68db173efc7e924558b8068920b49'
      ),
      createTerrainTile(
        'swissalti3d_2023_2771-1171_2_2056_5728.tif',
        'a84d9fbdff998e83f8eb6645c89c1b49005b4b1d5574c42444d0da9014d3c037'
      ),
      createTerrainTile(
        'swissalti3d_2023_2771-1172_2_2056_5728.tif',
        '18c356faa6b742845739bd403282fd541b1124ce94ec925f94b302c81e326512'
      )
    ]
  },
  'bernina-pass': {
    sourceBoundsLV95: [2797000, 1140700, 2799700, 1144200],
    tiles: [
      createTerrainTile(
        'swissalti3d_2023_2797-1140_2_2056_5728.tif',
        'f3029f7d83bf3beb60078c3f9379839b2b11e5673ba7abb055fa92d185b90859'
      ),
      createTerrainTile(
        'swissalti3d_2023_2797-1141_2_2056_5728.tif',
        'bd545875ac8b5850cb4d1e08f22f7cb3ecb93d3d8ad3f2113c469aecb5f184b9'
      ),
      createTerrainTile(
        'swissalti3d_2023_2797-1142_2_2056_5728.tif',
        '92c33587f03e4b46185adc191a118db16e073921c5d88aa17074ee2f2fc3ad69'
      ),
      createTerrainTile(
        'swissalti3d_2023_2797-1143_2_2056_5728.tif',
        'e1308c32f740bd02e99863041548f73d1beaefecacaa570bcc33b6344e51365e'
      ),
      createTerrainTile(
        'swissalti3d_2023_2797-1144_2_2056_5728.tif',
        '249eb2c230bddd0f4296f994a2529ae0f5a7db5ca4731e9d95f07ccb8370dcbc'
      ),
      createTerrainTile(
        'swissalti3d_2023_2798-1140_2_2056_5728.tif',
        'd2dccb835dfa452fe1840abbb67c233ecb912e36f2f8acb68866e21d9f7f8619'
      ),
      createTerrainTile(
        'swissalti3d_2023_2798-1141_2_2056_5728.tif',
        'c1476a5a6d24f1609cd42e3528cbfe0bb8b19c8e0389011a0146a33649480a02'
      ),
      createTerrainTile(
        'swissalti3d_2023_2798-1142_2_2056_5728.tif',
        '3675d997db618633789f8fb7e4a26f3bdd0f68ab9c421785916f2e19ac699968'
      ),
      createTerrainTile(
        'swissalti3d_2023_2798-1143_2_2056_5728.tif',
        'e58a3423d65e24d337324907ce501b95ab625b43081ccaac053db891c33bd76e'
      ),
      createTerrainTile(
        'swissalti3d_2023_2798-1144_2_2056_5728.tif',
        'ba029941590d6ac087e57d9ebfa97253f4c9fbc6be82f78099a85b392a871f5a'
      ),
      createTerrainTile(
        'swissalti3d_2023_2799-1140_2_2056_5728.tif',
        'f2b2fcf29e7accf02a8f1a91771dbad42663354ecd8dd194a14650a840a795b3'
      ),
      createTerrainTile(
        'swissalti3d_2023_2799-1141_2_2056_5728.tif',
        '5ca5583e172017ad6404c6d3c7a85c52559218e2133f5fad65ae211441fc56a8'
      ),
      createTerrainTile(
        'swissalti3d_2023_2799-1142_2_2056_5728.tif',
        'e0f37a6723376dbcf7bc353405ec7d5073671095f1ce7958595f0a722395855c'
      ),
      createTerrainTile(
        'swissalti3d_2023_2799-1143_2_2056_5728.tif',
        '349e25db932fbd354398200e1661bd4b3e89fede74ccd421a3b8c089aa58531c'
      ),
      createTerrainTile(
        'swissalti3d_2023_2799-1144_2_2056_5728.tif',
        '0a085a3a5b6a6a056d7cb33559e225c3c0cd4ecfbde2660226a98471dc1b53e5'
      )
    ]
  },
  'brusio-spiral': {
    sourceBoundsLV95: [2806800, 1124800, 2807800, 1127000],
    tiles: [
      createTerrainTile(
        'swissalti3d_2023_2806-1124_2_2056_5728.tif',
        '541c0481c6e0a3f6174157d3a37fc644d12849b0e7b1f0b3be47eff90e67f7ba'
      ),
      createTerrainTile(
        'swissalti3d_2023_2806-1125_2_2056_5728.tif',
        '00db7500a7ed62b3ac3c0e7dd57c7c7c75060f5d4537e94a6621591c04d30481'
      ),
      createTerrainTile(
        'swissalti3d_2023_2806-1126_2_2056_5728.tif',
        'e92f23b2adace568d622a61f78d91fb4706023d4525bdaedb7c752c91cb6881f'
      ),
      createTerrainTile(
        'swissalti3d_2023_2807-1124_2_2056_5728.tif',
        '812abe57bb70be0f5b9394510847032441a206ad8b884142fe16f1877d6eff76'
      ),
      createTerrainTile(
        'swissalti3d_2023_2807-1125_2_2056_5728.tif',
        '1ea8f63949fecd1f08232cf6a4f18db6127df006f57271f8792ff668599f1fb3'
      ),
      createTerrainTile(
        'swissalti3d_2023_2807-1126_2_2056_5728.tif',
        '496fd2029a064524792095bf34ec7a42bf209c5c3468b9855d6c910016b60aa8'
      )
    ]
  }
};
