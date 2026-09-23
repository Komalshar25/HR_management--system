import Box from "@mui/material/Box";
import RecognitionWall from "./RecognitionWall";
import AnnouncementsCard from "./AnnouncementsCard";
import CelebrationsCard from "./CelebrationsCard";

const CommunityRow = ({ canOpenProfiles = false }) => (
  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, gap: 3, alignItems: "stretch" }}>
    <Box sx={{ position: "relative", minHeight: 520, "& > .MuiPaper-root": { position: "absolute", inset: 0, height: "auto" } }}>
      <RecognitionWall canOpenProfiles={canOpenProfiles} />
    </Box>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <AnnouncementsCard />
      <CelebrationsCard />
    </Box>
  </Box>
);

export default CommunityRow;
